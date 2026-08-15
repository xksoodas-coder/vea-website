import Image from "next/image";
import Link from "next/link";

import { deleteCategory } from "@/app/admin/actions";
import { getCategories } from "@/lib/categories";
import { pick } from "@/lib/content-types";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">الفئات</h1>
          <p className="mt-1 text-sm text-ink-soft">الفئات التي تختارها للمنتجات وتظهر في واجهة الموقع.</p>
        </div>
        <Link href="/admin/categories/new" className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
          + فئة جديدة
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-card border border-dashed border-line bg-white py-16 text-center text-ink-soft">
          لا توجد فئات بعد. أضف أول فئة الآن.
        </p>
      ) : (
        <ul className="grid gap-3">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center gap-4 rounded-card border border-line bg-white p-3 transition-colors hover:border-brand-200">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                {category.image && <Image src={category.image} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{pick(category.label, "ar") || pick(category.label, "fr") || "فئة بلا اسم"}</p>
                <p dir="ltr" className="mt-1 truncate text-xs text-ink-faint">{category.id}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link href={`/admin/categories/${category.id}`} className="rounded-lg px-3 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50">تعديل</Link>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={category.id} />
                  <button type="submit" className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600">حذف</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
