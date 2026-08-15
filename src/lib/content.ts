import "server-only";

import { connection } from "next/server";

import type { Content, StoredProduct } from "./content-types";
import { getBanners } from "./banners";
import { getCategories } from "./categories";
import { getProductBySlug as findProductBySlug, getProducts } from "./products";

/**
 * All editable storefront content is read from Turso so dashboard changes are
 * available to every Vercel instance without using files shipped at build time.
 */
export async function getContent(): Promise<Content> {
  // Product data is request-time data. This keeps database credentials out of
  // the build process and avoids serving an outdated pre-rendered catalogue.
  await connection();

  const [banners, categories, products] = await Promise.all([
    getBanners(),
    getCategories(),
    getProducts(),
  ]);
  return { banners, categories, products };
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
