import Link from "next/link";

import BannerForm from "@/components/admin/banner-form";

export default function NewBannerPage() {
  return (
    <>
      <nav className="mb-6"><Link href="/admin/banners" className="text-sm font-medium text-ink-soft transition-colors hover:text-brand-600">← الرجوع إلى الإعلانات</Link></nav>
      <h1 className="mb-8 text-2xl font-bold text-ink">إعلان جديد</h1>
      <BannerForm banner={null} />
    </>
  );
}
