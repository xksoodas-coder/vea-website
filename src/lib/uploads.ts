import "server-only";

import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

type Sniffed = { ext: string; mime: string };

/**
 * Identifies the format from the file's own bytes rather than trusting the
 * browser-supplied MIME type or extension — an attacker controls both.
 */
function sniff(bytes: Uint8Array): Sniffed | null {
  const at = (i: number) => bytes[i];
  const ascii = (start: number, length: number) =>
    String.fromCharCode(...bytes.subarray(start, start + length));

  if (at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }
  if (
    at(0) === 0x89 &&
    ascii(1, 3) === "PNG" &&
    at(4) === 0x0d &&
    at(5) === 0x0a &&
    at(6) === 0x1a &&
    at(7) === 0x0a
  ) {
    return { ext: "png", mime: "image/png" };
  }
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") {
    return { ext: "webp", mime: "image/webp" };
  }
  if (ascii(4, 4) === "ftyp" && /avif|avis/.test(ascii(8, 4))) {
    return { ext: "avif", mime: "image/avif" };
  }
  return null;
}

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; reason: "too-large" | "bad-type" | "empty" };

/**
 * Writes an uploaded image under /public/uploads with a random name.
 * The client's filename is discarded entirely, which removes any path
 * traversal or extension-spoofing surface.
 */
export async function saveUploadedImage(file: File): Promise<UploadResult> {
  if (!file || file.size === 0) return { ok: false, reason: "empty" };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, reason: "too-large" };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniff(bytes);
  if (!kind) return { ok: false, reason: "bad-type" };

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now().toString(36)}-${randomBytes(8).toString("hex")}.${kind.ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), bytes);

  return { ok: true, url: `/uploads/${name}` };
}

/**
 * Deletes an uploaded file, refusing anything outside /public/uploads so a
 * crafted path can never reach the rest of the filesystem.
 */
export async function deleteUploadedImage(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return;

  const target = path.join(UPLOAD_DIR, path.basename(url));
  if (path.dirname(target) !== UPLOAD_DIR) return;

  await fs.rm(target, { force: true });
}
