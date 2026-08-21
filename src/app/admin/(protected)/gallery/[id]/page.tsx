import Link from "next/link";
import { notFound } from "next/navigation";

import GalleryItemForm from "@/components/admin/gallery-item-form";
import { pick } from "@/lib/content-types";
import { getGalleryItemById } from "@/lib/gallery";

export const dynamic = "force-dynamic";

export default async function EditGalleryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getGalleryItemById(id);
  if (!item) notFound();

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
      <h1 className="mb-8 text-2xl font-bold text-ink">
        {pick(item.title, "ar") || pick(item.title, "fr") || "تعديل الصورة"}
      </h1>
      <GalleryItemForm item={item} />
    </>
  );
}
