import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import type { Content, StoredProduct } from "./content-types";

const CONTENT_FILE = path.join(process.cwd(), "data", "content.json");

const EMPTY: Content = { banners: [], categories: [], products: [] };

/**
 * The whole catalogue lives in one JSON file that the admin dashboard writes.
 * It is small enough that reading it per request costs nothing, and it keeps
 * the project free of a database for what is essentially a settings screen.
 */
export async function getContent(): Promise<Content> {
  try {
    const raw = await fs.readFile(CONTENT_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<Content>;
    return {
      banners: parsed.banners ?? [],
      categories: parsed.categories ?? [],
      products: parsed.products ?? [],
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return EMPTY;
    throw error;
  }
}

/** Writes atomically so a crash mid-save cannot truncate the catalogue. */
export async function saveContent(content: Content): Promise<void> {
  await fs.mkdir(path.dirname(CONTENT_FILE), { recursive: true });
  const tmp = `${CONTENT_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(content, null, 2), "utf8");
  await fs.rename(tmp, CONTENT_FILE);
}

export async function getProductBySlug(
  slug: string,
): Promise<StoredProduct | undefined> {
  const { products } = await getContent();
  return products.find((p) => p.slug === slug);
}

export async function getProductsByCategory(
  categoryId: string,
): Promise<StoredProduct[]> {
  const { products } = await getContent();
  return products.filter((p) => p.categoryIds.includes(categoryId));
}
