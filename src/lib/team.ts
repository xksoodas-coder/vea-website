import "server-only";

import {
  emptyLocalizedText,
  type DetailField,
  type LocalizedText,
  type StoredTeamMember,
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

function readDetails(value: unknown): DetailField[] {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry) => ({
      label: readText(JSON.stringify(entry?.label ?? {})),
      value: readText(JSON.stringify(entry?.value ?? {})),
    }));
  } catch {
    return [];
  }
}

const str = (value: unknown): string => (typeof value === "string" ? value : "");

function toMember(row: Row): StoredTeamMember {
  return {
    id: String(row.id),
    name: readText(row.name_json),
    role: readText(row.role_json),
    bio: readText(row.bio_json),
    photo: typeof row.photo === "string" && row.photo ? row.photo : null,
    email: str(row.email),
    phone: str(row.phone),
    linkedin: str(row.linkedin),
    details: readDetails(row.details_json),
    sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
    visible: Number(row.visible ?? 1) !== 0,
  };
}

const ORDER = "ORDER BY sort_order ASC, created_at ASC, id ASC";

/** Everything, hidden entries included — this is the dashboard's view. */
export async function getTeamMembers(): Promise<StoredTeamMember[]> {
  const db = await getDatabase();
  const result = await db.execute(`SELECT * FROM team_members ${ORDER}`);
  return result.rows.map((row) => toMember(row as Row));
}

/** Only what the public About page is allowed to show. */
export async function getVisibleTeamMembers(): Promise<StoredTeamMember[]> {
  const db = await getDatabase();
  const result = await db.execute(
    `SELECT * FROM team_members WHERE visible = 1 ${ORDER}`,
  );
  return result.rows.map((row) => toMember(row as Row));
}

export async function getTeamMemberById(
  id: string,
): Promise<StoredTeamMember | undefined> {
  const db = await getDatabase();
  const result = await db.execute({
    sql: "SELECT * FROM team_members WHERE id = :id LIMIT 1",
    args: { id },
  });
  return result.rows[0] ? toMember(result.rows[0] as Row) : undefined;
}

export async function saveTeamMemberRecord(member: StoredTeamMember): Promise<void> {
  const db = await getDatabase();
  await db.execute({
    sql: `
      INSERT INTO team_members
        (id, name_json, role_json, bio_json, photo, email, phone, linkedin,
         details_json, sort_order, visible)
      VALUES
        (:id, :name, :role, :bio, :photo, :email, :phone, :linkedin,
         :details, :sortOrder, :visible)
      ON CONFLICT(id) DO UPDATE SET
        name_json = excluded.name_json,
        role_json = excluded.role_json,
        bio_json = excluded.bio_json,
        photo = excluded.photo,
        email = excluded.email,
        phone = excluded.phone,
        linkedin = excluded.linkedin,
        details_json = excluded.details_json,
        sort_order = excluded.sort_order,
        visible = excluded.visible,
        updated_at = unixepoch()
    `,
    args: {
      id: member.id,
      name: JSON.stringify(member.name),
      role: JSON.stringify(member.role),
      bio: JSON.stringify(member.bio),
      photo: member.photo,
      email: member.email,
      phone: member.phone,
      linkedin: member.linkedin,
      details: JSON.stringify(member.details),
      sortOrder: member.sortOrder,
      visible: member.visible ? 1 : 0,
    },
  });
}

export async function deleteTeamMemberRecord(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute({ sql: "DELETE FROM team_members WHERE id = :id", args: { id } });
}
