import "server-only";

import {
  createHmac,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

import { cookies } from "next/headers";

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>;

const COOKIE_NAME = "vea_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const KEY_LEN = 64;

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Secrets come from the environment only — never from a committed file, and
 * never exposed to the client (no NEXT_PUBLIC_ prefix). Missing configuration
 * fails closed: the dashboard refuses every login rather than opening up.
 */
function sessionSecret(): string | null {
  const value = process.env.ADMIN_SESSION_SECRET;
  return value && value.length >= 32 ? value : null;
}

export function authConfigError(): string | null {
  if (!sessionSecret()) {
    return "ADMIN_SESSION_SECRET is missing or shorter than 32 characters.";
  }
  if (!process.env.ADMIN_PASSWORD_HASH && !process.env.ADMIN_PASSWORD) {
    return "Neither ADMIN_PASSWORD_HASH nor ADMIN_PASSWORD is set.";
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Password                                                                    */
/* -------------------------------------------------------------------------- */

/** Constant-time comparison that tolerates differing lengths. */
function safeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    // Still burn a comparison so the timing does not leak the length.
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

/**
 * Verifies against `ADMIN_PASSWORD_HASH` (scrypt, format `scrypt:salt:key`,
 * both hex) when present, falling back to a plain `ADMIN_PASSWORD`. The hash
 * is strongly preferred — generate one with `npm run admin:password`.
 */
export async function verifyPassword(input: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;

  if (hash) {
    const [scheme, saltHex, keyHex] = hash.split(":");
    if (scheme !== "scrypt" || !saltHex || !keyHex) return false;

    const expected = Buffer.from(keyHex, "hex");
    const actual = await scrypt(input, Buffer.from(saltHex, "hex"), expected.length);
    return safeEqual(actual, expected);
  }

  const plain = process.env.ADMIN_PASSWORD;
  if (!plain) return false;
  return safeEqual(Buffer.from(input, "utf8"), Buffer.from(plain, "utf8"));
}

/** Used by scripts/hash-password.mjs equivalent logic; kept here for reuse. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEY_LEN);
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

/* -------------------------------------------------------------------------- */
/* Session token — HMAC-signed, no server-side store needed                    */
/* -------------------------------------------------------------------------- */

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function issueToken(secret: string): string {
  const payload = `${Date.now() + SESSION_TTL_MS}.${randomBytes(12).toString("base64url")}`;
  return `${payload}.${sign(payload, secret)}`;
}

function tokenIsValid(token: string, secret: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [expires, nonce, signature] = parts;
  const payload = `${expires}.${nonce}`;

  if (!safeEqual(Buffer.from(signature), Buffer.from(sign(payload, secret)))) {
    return false;
  }

  const expiresAt = Number(expires);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

/* -------------------------------------------------------------------------- */
/* Session lifecycle                                                           */
/* -------------------------------------------------------------------------- */

export async function createSession(): Promise<void> {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");

  (await cookies()).set(COOKIE_NAME, issueToken(secret), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete({ name: COOKIE_NAME, path: "/admin" });
}

export async function isAuthenticated(): Promise<boolean> {
  const secret = sessionSecret();
  if (!secret) return false;

  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return Boolean(token && tokenIsValid(token, secret));
}

/**
 * Call at the top of every admin page AND inside every Server Action — a page
 * check alone does not protect an action, which is directly callable.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }
}

/* -------------------------------------------------------------------------- */
/* Login throttling                                                            */
/* -------------------------------------------------------------------------- */

const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

/**
 * In-memory and therefore per-instance: enough to stop casual brute forcing
 * of a single-admin panel. Move to a shared store if this ever runs on
 * multiple instances.
 */
export function throttleCheck(key: string): { blocked: boolean; retryInMs: number } {
  const entry = attempts.get(key);
  if (!entry) return { blocked: false, retryInMs: 0 };

  if (entry.until > Date.now() && entry.count >= MAX_ATTEMPTS) {
    return { blocked: true, retryInMs: entry.until - Date.now() };
  }
  if (entry.until <= Date.now()) attempts.delete(key);
  return { blocked: false, retryInMs: 0 };
}

export function throttleFail(key: string): void {
  const entry = attempts.get(key) ?? { count: 0, until: 0 };
  entry.count += 1;
  entry.until = Date.now() + LOCKOUT_MS;
  attempts.set(key, entry);
}

export function throttleReset(key: string): void {
  attempts.delete(key);
}
