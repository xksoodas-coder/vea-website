import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { connection } from "next/server";

import type { Content, StoredProduct } from "./content-types";
import { getProductBySlug as findProductBySlug, getProducts } from "./products";

const CONTENT_FILE = path.join(process.cwd(), "data", "content.json");

const EMPTY: Content = { banners: [], categories: [], products: [] };

/**
 * Banners and categories are static site configuration. Products are always
 * read from Turso so dashboard changes are available to every Vercel instance.
 */
export async function getContent(): Promise<Content> {
  // Product data is request-time data. This keeps database credentials out of
  // the build process and avoids serving an outdated pre-rendered catalogue.
  await connection();

  try {
    const raw = await fs.readFile(CONTENT_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<Content>;
    return {
      banners: parsed.banners ?? [],
      categories: parsed.categories ?? [],
      products: await getProducts(),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return EMPTY;
    throw error;
  }
}

export async function getProductBySlug(
  slug: string,
): Promise<StoredProduct | undefined> {
  return findProductBySlug(slug);
}

export async function getProductsByCategory(
  categoryId: string,
): Promise<StoredProduct[]> {
  const products = await getProducts();
  return products.filter((product) => product.categoryIds.includes(categoryId));
}
