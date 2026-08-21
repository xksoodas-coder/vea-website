import Link from "next/link";
import { notFound } from "next/navigation";

import TeamMemberForm from "@/components/admin/team-member-form";
import { pick } from "@/lib/content-types";
import { getTeamMemberById } from "@/lib/team";

export const dynamic = "force-dynamic";

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getTeamMemberById(id);
  if (!member) notFound();

  return (
    <>
      <nav className="mb-6">
        <Link
          href="/admin/team"
          className="text-sm font-medium text-ink-soft transition-colors hover:text-brand-600"
        >
          ← الرجوع إلى الفريق
        </Link>
      </nav>
      <h1 className="mb-8 text-2xl font-bold text-ink">
        {pick(member.name, "ar") || pick(member.name, "fr") || "تعديل الموظف"}
      </h1>
      <TeamMemberForm member={member} />
    </>
  );
}
