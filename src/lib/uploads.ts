import "server-only";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Buffer } from "node:buffer";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

type R2Config = {
  bucket: string;
  publicBaseUrl: URL;
};

let r2: S3Client | undefined;
let r2Config: R2Config | undefined;

function getR2Config(): R2Config {
  if (r2Config) return r2Config;

  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
    throw new Error(
      "R2 is not configured. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_BASE_URL.",
    );
  }

  r2 = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
  r2Config = { bucket, publicBaseUrl: new URL(publicBaseUrl) };
  return r2Config;
}

function getR2(): S3Client {
  getR2Config();
  return r2!;
}

function publicUrlFor(key: string): string {
  const base = getR2Config().publicBaseUrl;
  return new URL(key, `${base.href.replace(/\/+$/, "")}/`).href;
}

function keyForPublicUrl(url: string): string | undefined {
  const base = getR2Config().publicBaseUrl;
  const target = new URL(url);
  if (target.origin !== base.origin) return undefined;

  const prefix = base.pathname.replace(/\/+$/, "");
  if (!target.pathname.startsWith(`${prefix}/`)) return undefined;
  return decodeURIComponent(target.pathname.slice(prefix.length + 1));
}

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
  | { ok: false; reason: "too-large" | "bad-type" | "empty" | "storage-error" };

/**
 * Stores an uploaded image in Cloudflare R2. The original filename is never
 * used, which removes path traversal and extension-spoofing from the path.
 */
export async function saveUploadedImage(
  file: File,
  folder: "products" | "banners" = "products",
): Promise<UploadResult> {
  if (!file || file.size === 0) return { ok: false, reason: "empty" };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, reason: "too-large" };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniff(bytes);
  if (!kind) return { ok: false, reason: "bad-type" };

  try {
    const key = `${folder}/${crypto.randomUUID()}.${kind.ext}`;
    const { bucket } = getR2Config();
    await getR2().send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(bytes),
      ContentType: kind.mime,
      CacheControl: "public, max-age=31536000, immutable",
    }));

    return { ok: true, url: publicUrlFor(key) };
  } catch (error) {
    console.error("Cloudflare R2 image upload failed", error);
    return { ok: false, reason: "storage-error" };
  }
}

/** Deletes only product images stored in this project's Cloudflare R2 bucket. */
export async function deleteUploadedImage(url: string): Promise<void> {
  const key = keyForPublicUrl(url);
  if (!key || !/^(products|banners)\//.test(key)) return;

  const { bucket } = getR2Config();
  await getR2().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
