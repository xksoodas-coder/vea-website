import Link from "next/link";

import GalleryItemForm from "@/components/admin/gallery-item-form";

export default function NewGalleryItemPage() {
  return (
    <>
      <nav className="mb-6">
        <Link
          href="/admin/gallery"
          className="text-sm font-medium text-ink-soft transition-colors hover:text-brand-600"
        >
          ← الرجوع إلى صور الشركة
        </Link>
      </nav>
      <h1 className="mb-8 text-2xl font-bold text-ink">صورة جديدة</h1>
      <GalleryItemForm item={null} />
    </>
  );
}
