import Image from "next/image";
import Link from "next/link";

import { deleteBanner } from "@/app/admin/actions";
import { getBanners } from "@/lib/banners";
import { pick } from "@/lib/content-types";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const banners = await getBanners();

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">الإعلانات</h1>
          <p className="mt-1 text-sm text-ink-soft">صورة للحاسوب وصورة اختيارية للهاتف لكل إعلان.</p>
        </div>
        <Link href="/admin/banners/new" className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700">+ إعلان جديد</Link>
      </div>

      {banners.length === 0 ? (
        <p className="rounded-card border border-dashed border-line bg-white py-16 text-center text-ink-soft">لا توجد إعلانات بعد. أضف أول إعلان الآن.</p>
      ) : (
        <ul className="grid gap-3">
          {banners.map((banner) => (
            <li key={banner.id} className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-white p-3">
              <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                <Image src={banner.desktopImage} alt="" fill sizes="144px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{pick(banner.alt, "ar") || pick(banner.alt, "fr") || "إعلان بلا عنوان"}</p>
                <p className="mt-1 text-xs text-ink-soft">{banner.mobileImage ? "لديه صورة هاتف" : "يستخدم صورة الحاسوب على الهاتف"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link href={`/admin/banners/${banner.id}`} className="rounded-lg px-3 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50">تعديل</Link>
                <form action={deleteBanner}>
                  <input type="hidden" name="id" value={banner.id} />
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
