import Link from "next/link";

import CompanyForm from "@/components/admin/company-form";
import { getCompanyProfile } from "@/lib/company";
import { getGalleryItems } from "@/lib/gallery";
import { getTeamMembers } from "@/lib/team";

export const dynamic = "force-dynamic";

export default async function CompanyPage() {
  const [profile, members, gallery] = await Promise.all([
    getCompanyProfile(),
    getTeamMembers(),
    getGalleryItems(),
  ]);

  const visibleMembers = members.filter((member) => member.visible).length;
  const visibleImages = gallery.filter((item) => item.visible).length;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">عن شركتنا</h1>
        <p className="mt-1 text-sm text-ink-soft">
          كل ما يظهر في صفحة «عن شركتنا» بالموقع: تعريف الشركة، الفريق، وصور الشركة.
        </p>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/team"
          className="rounded-card border border-line bg-white p-5 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
        >
          <p className="font-semibold text-brand-600">الفريق وأصحاب الشركة</p>
          <p className="tabular mt-1 text-sm text-ink-soft">
            {members.length} شخصًا · {visibleMembers} ظاهر
          </p>
        </Link>

        <Link
          href="/admin/gallery"
          className="rounded-card border border-line bg-white p-5 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
        >
          <p className="font-semibold text-brand-600">صور الشركة</p>
          <p className="tabular mt-1 text-sm text-ink-soft">
            {gallery.length} صورة · {visibleImages} ظاهرة
          </p>
        </Link>
      </div>

      <CompanyForm profile={profile} />
    </>
  );
}
