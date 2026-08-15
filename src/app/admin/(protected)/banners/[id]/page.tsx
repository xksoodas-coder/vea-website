import Link from "next/link";
import { notFound } from "next/navigation";

import BannerForm from "@/components/admin/banner-form";
import { getBannerById } from "@/lib/banners";
import { pick } from "@/lib/content-types";

export const dynamic = "force-dynamic";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const banner = await getBannerById(id);
  if (!banner) notFound();

  return (
    <>
      <nav className="mb-6"><Link href="/admin/banners" className="text-sm font-medium text-ink-soft transition-colors hover:text-brand-600">← الرجوع إلى الإعلانات</Link></nav>
      <h1 className="mb-8 text-2xl font-bold text-ink">{pick(banner.alt, "ar") || pick(banner.alt, "fr") || "تعديل الإعلان"}</h1>
      <BannerForm banner={banner} />
    </>
  );
}
