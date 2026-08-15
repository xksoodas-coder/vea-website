import "server-only";

import type { LocalizedText, StoredCategory } from "./content-types";
import { getDatabase } from "./turso";

type CategoryRow = Record<string, unknown>;

function readLabel(value: unknown): LocalizedText {
  if (typeof value !== "string") return { fr: "", ar: "", en: "" };
  try {
    return JSON.parse(value) as LocalizedText;
  } catch {
    return { fr: "", ar: "", en: "" };
  }
}

function toCategory(row: CategoryRow): StoredCategory {
  return {
    id: String(row.id),
    label: readLabel(row.label_json),
    image: typeof row.image === "string" ? row.image : null,
  };
}

export async function getCategories(): Promise<StoredCategory[]> {
  const db = await getDatabase();
  const result = await db.execute(
    "SELECT * FROM categories ORDER BY created_at ASC, id ASC",
  );
  return result.rows.map((row) => toCategory(row as CategoryRow));
}

export async function getCategoryById(
  id: string,
): Promise<StoredCategory | undefined> {
  const db = await getDatabase();
  const result = await db.execute({
    sql: "SELECT * FROM categories WHERE id = :id LIMIT 1",
    args: { id },
  });
  return result.rows[0] ? toCategory(result.rows[0] as CategoryRow) : undefined;
}

export async function saveCategoryRecord(category: StoredCategory): Promise<void> {
  const db = await getDatabase();
  await db.execute({
    sql: `
      INSERT INTO categories (id, label_json, image)
      VALUES (:id, :label, :image)
      ON CONFLICT(id) DO UPDATE SET
        label_json = excluded.label_json,
        image = excluded.image,
        updated_at = unixepoch()
    `,
    args: {
      id: category.id,
      label: JSON.stringify(category.label),
      image: category.image,
    },
  });
}

export async function deleteCategoryRecord(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute({ sql: "DELETE FROM categories WHERE id = :id", args: { id } });
}
