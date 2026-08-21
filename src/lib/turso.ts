import "server-only";

import { createClient, type Client } from "@libsql/client";

let client: Client | undefined;
let schemaPromise: Promise<void> | undefined;

function getClient(): Client {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    throw new Error(
      "Turso is not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.",
    );
  }

  client = createClient({ url, authToken });
  return client;
}

async function ensureSchema(db: Client): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = db
      .batch(
        [
          {
            sql: `
              CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                name_json TEXT NOT NULL,
                description_json TEXT NOT NULL,
                line_json TEXT NOT NULL,
                volume_ml INTEGER,
                size_label_json TEXT,
                category_ids_json TEXT NOT NULL,
                images_json TEXT NOT NULL,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch())
              )
            `,
          },
          {
            sql: "CREATE INDEX IF NOT EXISTS products_slug_idx ON products(slug)",
          },
          {
            sql: `
              CREATE TABLE IF NOT EXISTS banners (
                id TEXT PRIMARY KEY NOT NULL,
                desktop_image TEXT NOT NULL,
                mobile_image TEXT,
                alt_json TEXT NOT NULL,
                href TEXT NOT NULL DEFAULT '',
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch())
              )
            `,
          },
          {
            sql: "CREATE INDEX IF NOT EXISTS banners_sort_idx ON banners(sort_order, id)",
          },
          {
            sql: `
              CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY NOT NULL,
                label_json TEXT NOT NULL,
                image TEXT,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch())
              )
            `,
          },
          {
            sql: "CREATE INDEX IF NOT EXISTS categories_created_idx ON categories(created_at, id)",
          },
          {
            // Singleton: exactly one row, keyed 'main'. The whole profile is
            // one JSON blob because its shape (stats, values) is a list the
            // admin grows freely, not a fixed set of columns.
            sql: `
              CREATE TABLE IF NOT EXISTS company_profile (
                id TEXT PRIMARY KEY NOT NULL,
                data_json TEXT NOT NULL,
                updated_at INTEGER NOT NULL DEFAULT (unixepoch())
              )
            `,
          },
          {
            sql: `
              CREATE TABLE IF NOT EXISTS team_members (
                id TEXT PRIMARY KEY NOT NULL,
                name_json TEXT NOT NULL,
                role_json TEXT NOT NULL,
                bio_json TEXT NOT NULL,
                photo TEXT,
                email TEXT NOT NULL DEFAULT '',
                phone TEXT NOT NULL DEFAULT '',
                linkedin TEXT NOT NULL DEFAULT '',
                details_json TEXT NOT NULL DEFAULT '[]',
                sort_order INTEGER NOT NULL DEFAULT 0,
                visible INTEGER NOT NULL DEFAULT 1,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch())
              )
            `,
          },
          {
            sql: "CREATE INDEX IF NOT EXISTS team_members_sort_idx ON team_members(sort_order, id)",
          },
          {
            sql: `
              CREATE TABLE IF NOT EXISTS company_gallery (
                id TEXT PRIMARY KEY NOT NULL,
                image TEXT NOT NULL,
                title_json TEXT NOT NULL,
                description_json TEXT NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0,
                visible INTEGER NOT NULL DEFAULT 1,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch())
              )
            `,
          },
          {
            sql: "CREATE INDEX IF NOT EXISTS company_gallery_sort_idx ON company_gallery(sort_order, id)",
          },
        ],
        "write",
      )
      .then(() => undefined)
      .catch((error) => {
        schemaPromise = undefined;
        throw error;
      });
  }

  await schemaPromise;
}

/** Returns a connected client and creates the tables on its first use. */
export async function getDatabase(): Promise<Client> {
  const db = getClient();
  await ensureSchema(db);
  return db;
}
