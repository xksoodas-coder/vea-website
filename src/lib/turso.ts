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

/** Returns a connected client and creates the product table on its first use. */
export async function getDatabase(): Promise<Client> {
  const db = getClient();
  await ensureSchema(db);
  return db;
}
