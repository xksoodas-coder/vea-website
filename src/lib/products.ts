import "server-only";

import type { StoredProduct } from "./content-types";
import { getDatabase } from "./turso";

type ProductRow = Record<string, unknown>;

function readJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function toProduct(row: ProductRow): StoredProduct {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: readJson(row.name_json, { fr: "", ar: "", en: "" }),
    description: readJson(row.description_json, { fr: "", ar: "", en: "" }),
    line: readJson(row.line_json, { fr: "", ar: "", en: "" }),
    volumeMl: typeof row.volume_ml === "number" ? row.volume_ml : null,
    sizeLabel: row.size_label_json
      ? readJson(row.size_label_json, { fr: "", ar: "", en: "" })
      : null,
    categoryIds: readJson(row.category_ids_json, []),
    images: readJson(row.images_json, []),
  };
}

export async function getProducts(): Promise<StoredProduct[]> {
  const db = await getDatabase();
  const result = await db.execute(
    "SELECT * FROM products ORDER BY created_at DESC, id DESC",
  );
  return result.rows.map((row) => toProduct(row as ProductRow));
}

export async function getProductById(
  id: string,
): Promise<StoredProduct | undefined> {
  const db = await getDatabase();
  const result = await db.execute({
    sql: "SELECT * FROM products WHERE id = :id LIMIT 1",
    args: { id },
  });
  return result.rows[0] ? toProduct(result.rows[0] as ProductRow) : undefined;
}

export async function getProductBySlug(
  slug: string,
): Promise<StoredProduct | undefined> {
  const db = await getDatabase();
  const result = await db.execute({
    sql: "SELECT * FROM products WHERE slug = :slug LIMIT 1",
    args: { slug },
  });
  return result.rows[0] ? toProduct(result.rows[0] as ProductRow) : undefined;
}

export async function saveProductRecord(product: StoredProduct): Promise<void> {
  const db = await getDatabase();
  await db.execute({
    sql: `
      INSERT INTO products (
        id, slug, name_json, description_json, line_json, volume_ml,
        size_label_json, category_ids_json, images_json
      ) VALUES (
        :id, :slug, :name, :description, :line, :volumeMl,
        :sizeLabel, :categoryIds, :images
      )
      ON CONFLICT(id) DO UPDATE SET
        slug = excluded.slug,
        name_json = excluded.name_json,
        description_json = excluded.description_json,
        line_json = excluded.line_json,
        volume_ml = excluded.volume_ml,
        size_label_json = excluded.size_label_json,
        category_ids_json = excluded.category_ids_json,
        images_json = excluded.images_json,
        updated_at = unixepoch()
    `,
    args: {
      id: product.id,
      slug: product.slug,
      name: JSON.stringify(product.name),
      description: JSON.stringify(product.description),
      line: JSON.stringify(product.line),
      volumeMl: product.volumeMl,
      sizeLabel: product.sizeLabel ? JSON.stringify(product.sizeLabel) : null,
      categoryIds: JSON.stringify(product.categoryIds),
      images: JSON.stringify(product.images),
    },
  });
}

export async function deleteProductRecord(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute({ sql: "DELETE FROM products WHERE id = :id", args: { id } });
}
