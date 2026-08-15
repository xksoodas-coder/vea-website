import Image from "next/image";
import Link from "next/link";

import { deleteProduct } from "@/app/admin/actions";
import { defaultLocale } from "@/i18n/config";
import { getContent } from "@/lib/content";
import { pick } from "@/lib/content-types";
import { PLACEHOLDER_IMAGE } from "@/lib/view";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const { products, categories } = await getContent();

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">المنتجات</h1>
          <p className="tabular mt-1 text-sm text-ink-soft">
            {products.length} منتجًا · {categories.length} فئات
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-700"
        >
          + منتج جديد
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
      <Link href="/admin/categories" className="inline-flex rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-brand-600 transition-colors hover:border-brand-200 hover:bg-brand-50">
        إدارة الفئات
      </Link>
      <Link href="/admin/banners" className="inline-flex rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-brand-600 transition-colors hover:border-brand-200 hover:bg-brand-50">
        إدارة الإعلانات وصور الهاتف والحاسوب
      </Link>
      </div>

      {products.length === 0 ? (
        <p className="rounded-card border border-dashed border-line bg-white py-16 text-center text-ink-soft">
          لا توجد منتجات بعد. ابدأ بإضافة منتج.
        </p>
      ) : (
        <ul className="grid gap-3">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex items-center gap-4 rounded-card border border-line bg-white p-3 transition-colors duration-200 hover:border-brand-200"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                <Image
                  src={product.images[0] || PLACEHOLDER_IMAGE}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">
                  {pick(product.name, "ar") || pick(product.name, defaultLocale)}
                </p>
                <p dir="ltr" className="truncate text-start text-xs text-ink-faint">
                  /{product.slug}
                </p>
                <p className="tabular mt-1 text-xs text-ink-soft">
                  {product.volumeMl ? `${product.volumeMl} مل` : "—"}
                  {" · "}
                  {product.images.length} صورة
                  {" · "}
                  {product.categoryIds.length} فئة
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-brand-600 transition-colors duration-200 hover:bg-brand-50"
                >
                  تعديل
                </Link>

                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={product.id} />
                  <button
                    type="submit"
                    className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-ink-faint transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
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
