import "server-only";

import type { LocalizedText, StoredBanner } from "./content-types";
import { getDatabase } from "./turso";

type BannerRow = Record<string, unknown>;

function readAlt(value: unknown): LocalizedText {
  if (typeof value !== "string") return { fr: "", ar: "", en: "" };
  try {
    return JSON.parse(value) as LocalizedText;
  } catch {
    return { fr: "", ar: "", en: "" };
  }
}

function toBanner(row: BannerRow): StoredBanner {
  return {
    id: String(row.id),
    desktopImage: String(row.desktop_image),
    mobileImage: typeof row.mobile_image === "string" ? row.mobile_image : null,
    alt: readAlt(row.alt_json),
    href: typeof row.href === "string" ? row.href : "",
    sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
  };
}

export async function getBanners(): Promise<StoredBanner[]> {
  const db = await getDatabase();
  const result = await db.execute(
    "SELECT * FROM banners ORDER BY sort_order ASC, created_at ASC, id ASC",
  );
  return result.rows.map((row) => toBanner(row as BannerRow));
}

export async function getBannerById(id: string): Promise<StoredBanner | undefined> {
  const db = await getDatabase();
  const result = await db.execute({
    sql: "SELECT * FROM banners WHERE id = :id LIMIT 1",
    args: { id },
  });
  return result.rows[0] ? toBanner(result.rows[0] as BannerRow) : undefined;
}

export async function saveBannerRecord(banner: StoredBanner): Promise<void> {
  const db = await getDatabase();
  await db.execute({
    sql: `
      INSERT INTO banners (id, desktop_image, mobile_image, alt_json, href, sort_order)
      VALUES (:id, :desktopImage, :mobileImage, :alt, :href, :sortOrder)
      ON CONFLICT(id) DO UPDATE SET
        desktop_image = excluded.desktop_image,
        mobile_image = excluded.mobile_image,
        alt_json = excluded.alt_json,
        href = excluded.href,
        sort_order = excluded.sort_order,
        updated_at = unixepoch()
    `,
    args: {
      id: banner.id,
      desktopImage: banner.desktopImage,
      mobileImage: banner.mobileImage,
      alt: JSON.stringify(banner.alt),
      href: banner.href,
      sortOrder: banner.sortOrder,
    },
  });
}

export async function deleteBannerRecord(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute({ sql: "DELETE FROM banners WHERE id = :id", args: { id } });
}
