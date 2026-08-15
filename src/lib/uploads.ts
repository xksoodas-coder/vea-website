import "server-only";

import { del, put } from "@vercel/blob";
import { Buffer } from "node:buffer";

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
 * Stores an uploaded image in Vercel Blob. The original filename is never
 * used, which removes path traversal and extension-spoofing from the path.
 */
export async function saveUploadedImage(file: File): Promise<UploadResult> {
  if (!file || file.size === 0) return { ok: false, reason: "empty" };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, reason: "too-large" };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniff(bytes);
  if (!kind) return { ok: false, reason: "bad-type" };

  const blob = await put(`products/${crypto.randomUUID()}.${kind.ext}`, Buffer.from(bytes), {
    access: "public",
    addRandomSuffix: false,
    contentType: kind.mime,
  });

  return { ok: true, url: blob.url };
}

/** Deletes only product images stored in this project's Vercel Blob store. */
export async function deleteUploadedImage(url: string): Promise<void> {
  if (!/^https:\/\/.+\.public\.blob\.vercel-storage\.com\/products\//.test(url)) {
    return;
  }
  await del(url);
}
