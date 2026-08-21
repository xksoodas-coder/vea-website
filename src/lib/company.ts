import "server-only";

import {
  emptyLocalizedText,
  emptyProfile,
  type CompanyProfile,
  type CompanyStat,
  type CompanyValue,
  type LocalizedText,
} from "./content-types";
import { getDatabase } from "./turso";

/** The one row this table ever holds. */
const PROFILE_ID = "main";

function readText(value: unknown): LocalizedText {
  if (!value || typeof value !== "object") return emptyLocalizedText();
  const base = emptyLocalizedText();
  for (const key of Object.keys(base) as (keyof LocalizedText)[]) {
    const entry = (value as Record<string, unknown>)[key];
    if (typeof entry === "string") base[key] = entry;
  }
  return base;
}

function readStats(value: unknown): CompanyStat[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => ({
    value: typeof (entry as CompanyStat)?.value === "string" ? (entry as CompanyStat).value : "",
    label: readText((entry as CompanyStat)?.label),
  }));
}

function readValues(value: unknown): CompanyValue[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => ({
    title: readText((entry as CompanyValue)?.title),
    description: readText((entry as CompanyValue)?.description),
  }));
}

/**
 * Never throws on malformed JSON and never returns undefined — the About page
 * renders whatever sections happen to carry text, so an empty profile is a
 * valid state rather than an error.
 */
export async function getCompanyProfile(): Promise<CompanyProfile> {
  const db = await getDatabase();
  const result = await db.execute({
    sql: "SELECT data_json FROM company_profile WHERE id = :id LIMIT 1",
    args: { id: PROFILE_ID },
  });

  const raw = result.rows[0]?.data_json;
  if (typeof raw !== "string") return emptyProfile();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyProfile();
  }

  const source = (parsed ?? {}) as Record<string, unknown>;
  return {
    headline: readText(source.headline),
    intro: readText(source.intro),
    story: readText(source.story),
    mission: readText(source.mission),
    vision: readText(source.vision),
    stats: readStats(source.stats),
    values: readValues(source.values),
  };
}

export async function saveCompanyProfile(profile: CompanyProfile): Promise<void> {
  const db = await getDatabase();
  await db.execute({
    sql: `
      INSERT INTO company_profile (id, data_json)
      VALUES (:id, :data)
      ON CONFLICT(id) DO UPDATE SET
        data_json = excluded.data_json,
        updated_at = unixepoch()
    `,
    args: { id: PROFILE_ID, data: JSON.stringify(profile) },
  });
}
