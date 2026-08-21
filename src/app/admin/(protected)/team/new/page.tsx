import Link from "next/link";

import TeamMemberForm from "@/components/admin/team-member-form";

export default function NewTeamMemberPage() {
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
      <h1 className="mb-8 text-2xl font-bold text-ink">شخص جديد</h1>
      <TeamMemberForm member={null} />
    </>
  );
}
