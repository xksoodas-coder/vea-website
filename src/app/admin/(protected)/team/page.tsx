import Image from "next/image";
import Link from "next/link";

import { deleteTeamMember, toggleTeamMemberVisibility } from "@/app/admin/actions";
import { pick } from "@/lib/content-types";
import { getTeamMembers } from "@/lib/team";

export const dynamic = "force-dynamic";

/** Initials stand in when no portrait has been uploaded. */
function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "؟"
  );
}

export default async function TeamPage() {
  const members = await getTeamMembers();

  return (
    <>
      <nav className="mb-6">
        <Link
          href="/admin/company"
          className="text-sm font-medium text-ink-soft transition-colors hover:text-brand-600"
        >
          ← الرجوع إلى «عن شركتنا»
        </Link>
      </nav>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">الفريق وأصحاب الشركة</h1>
          <p className="tabular mt-1 text-sm text-ink-soft">
            {members.length} شخصًا · {members.filter((m) => m.visible).length} ظاهر في
            الموقع
          </p>
        </div>

        <Link
          href="/admin/team/new"
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          + شخص جديد
        </Link>
      </div>

      {members.length === 0 ? (
        <p className="rounded-card border border-dashed border-line bg-white py-16 text-center text-ink-soft">
          لا يوجد أشخاص بعد. أضف أول عضو في الفريق.
        </p>
      ) : (
        <ul className="grid gap-3">
          {members.map((member) => {
            const name =
              pick(member.name, "ar") || pick(member.name, "fr") || "بدون اسم";
            return (
              <li
                key={member.id}
                className={`flex items-center gap-4 rounded-card border p-3 transition-colors hover:border-brand-200 ${
                  member.visible
                    ? "border-line bg-white"
                    : "border-dashed border-line bg-surface-2/70"
                }`}
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex size-full items-center justify-center text-lg font-light text-brand-300"
                    >
                      {initials(name)}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{name}</p>
                  <p className="truncate text-sm text-ink-soft">
                    {pick(member.role, "ar") || pick(member.role, "fr") || "—"}
                  </p>
                  <p className="tabular mt-1 text-xs text-ink-faint">
                    ترتيب {member.sortOrder} · {member.details.length} معلومة إضافية
                    {member.visible ? "" : " · مخفي"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <form action={toggleTeamMemberVisibility}>
                    <input type="hidden" name="id" value={member.id} />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-600"
                    >
                      {member.visible ? "إخفاء" : "إظهار"}
                    </button>
                  </form>

                  <Link
                    href={`/admin/team/${member.id}`}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
                  >
                    تعديل
                  </Link>

                  <form action={deleteTeamMember}>
                    <input type="hidden" name="id" value={member.id} />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      حذف
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
