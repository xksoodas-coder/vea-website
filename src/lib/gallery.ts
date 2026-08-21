import "server-only";

import {
  emptyLocalizedText,
  type LocalizedText,
  type StoredGalleryItem,
} from "./content-types";
import { getDatabase } from "./turso";

type Row = Record<string, unknown>;

function readText(value: unknown): LocalizedText {
  if (typeof value !== "string") return emptyLocalizedText();
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const base = emptyLocalizedText();
    for (const key of Object.keys(base) as (keyof LocalizedText)[]) {
      if (typeof parsed?.[key] === "string") base[key] = parsed[key] as string;
    }
    return base;
  } catch {
    return emptyLocalizedText();
  }
}

function toItem(row: Row): StoredGalleryItem {
  return {
    id: String(row.id),
    image: String(row.image),
    title: readText(row.title_json),
    description: readText(row.description_json),
    sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
    visible: Number(row.visible ?? 1) !== 0,
  };
}

const ORDER = "ORDER BY sort_order ASC, created_at ASC, id ASC";

/** Everything, hidden entries included — this is the dashboard's view. */
export async function getGalleryItems(): Promise<StoredGalleryItem[]> {
  const db = await getDatabase();
  const result = await db.execute(`SELECT * FROM company_gallery ${ORDER}`);
  return result.rows.map((row) => toItem(row as Row));
}

/** Only what the public About page is allowed to show. */
export async function getVisibleGalleryItems(): Promise<StoredGalleryItem[]> {
  const db = await getDatabase();
  const result = await db.execute(
    `SELECT * FROM company_gallery WHERE visible = 1 ${ORDER}`,
  );
  return result.rows.map((row) => toItem(row as Row));
}

export async function getGalleryItemById(
  id: string,
): Promise<StoredGalleryItem | undefined> {
  const db = await getDatabase();
  const result = await db.execute({
    sql: "SELECT * FROM company_gallery WHERE id = :id LIMIT 1",
    args: { id },
  });
  return result.rows[0] ? toItem(result.rows[0] as Row) : undefined;
}

export async function saveGalleryItemRecord(item: StoredGalleryItem): Promise<void> {
  const db = await getDatabase();
  await db.execute({
    sql: `
      INSERT INTO company_gallery
        (id, image, title_json, description_json, sort_order, visible)
      VALUES
        (:id, :image, :title, :description, :sortOrder, :visible)
      ON CONFLICT(id) DO UPDATE SET
        image = excluded.image,
        title_json = excluded.title_json,
        description_json = excluded.description_json,
        sort_order = excluded.sort_order,
        visible = excluded.visible,
        updated_at = unixepoch()
    `,
    args: {
      id: item.id,
      image: item.image,
      title: JSON.stringify(item.title),
      description: JSON.stringify(item.description),
      sortOrder: item.sortOrder,
      visible: item.visible ? 1 : 0,
    },
  });
}

export async function deleteGalleryItemRecord(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute({ sql: "DELETE FROM company_gallery WHERE id = :id", args: { id } });
}
