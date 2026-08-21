import Image from "next/image";
import Link from "next/link";

import { deleteGalleryItem, toggleGalleryItemVisibility } from "@/app/admin/actions";
import { pick } from "@/lib/content-types";
import { getGalleryItems } from "@/lib/gallery";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const items = await getGalleryItems();

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
          <h1 className="text-2xl font-bold text-ink">صور الشركة</h1>
          <p className="tabular mt-1 text-sm text-ink-soft">
            {items.length} صورة · {items.filter((item) => item.visible).length} ظاهرة
            في الموقع
          </p>
        </div>

        <Link
          href="/admin/gallery/new"
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          + صورة جديدة
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-card border border-dashed border-line bg-white py-16 text-center text-ink-soft">
          لا توجد صور بعد. أضف أول صورة عن الشركة.
        </p>
      ) : (
        <ul className="grid gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className={`flex items-center gap-4 rounded-card border p-3 transition-colors hover:border-brand-200 ${
                item.visible
                  ? "border-line bg-white"
                  : "border-dashed border-line bg-surface-2/70"
              }`}
            >
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">
                  {pick(item.title, "ar") || pick(item.title, "fr") || "بدون عنوان"}
                </p>
                <p className="truncate text-sm text-ink-soft">
                  {pick(item.description, "ar") ||
                    pick(item.description, "fr") ||
                    "—"}
                </p>
                <p className="tabular mt-1 text-xs text-ink-faint">
                  ترتيب {item.sortOrder}
                  {item.visible ? "" : " · مخفية"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <form action={toggleGalleryItemVisibility}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-600"
                  >
                    {item.visible ? "إخفاء" : "إظهار"}
                  </button>
                </form>

                <Link
                  href={`/admin/gallery/${item.id}`}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
                >
                  تعديل
                </Link>

                <form action={deleteGalleryItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    حذف
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
