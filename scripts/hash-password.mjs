/**
 * Turns a password into an scrypt hash for ADMIN_PASSWORD_HASH.
 *
 *   node scripts/hash-password.mjs "your-password"
 *
 * Paste the printed line into .env.local. The plaintext never touches disk.
 */
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb);

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "your-password"');
  process.exit(1);
}

if (password.length < 12) {
  console.error("Refusing: use at least 12 characters.");
  process.exit(1);
}

const salt = randomBytes(16);
const key = await scrypt(password, salt, 64);

console.log("\nAdd these two lines to .env.local:\n");
console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString("hex")}:${key.toString("hex")}`);
console.log(`ADMIN_SESSION_SECRET=${randomBytes(32).toString("hex")}`);
console.log("");
