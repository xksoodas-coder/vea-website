"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";

import { saveBanner, type ActionState } from "@/app/admin/actions";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { emptyLocalizedText, type LocalizedText, type StoredBanner } from "@/lib/content-types";

const initial: ActionState = {};

const localeHint: Record<Locale, string> = {
  fr: "الفرنسية",
  ar: "العربية",
  en: "الإنجليزية",
};

function AltFields({ value }: { value: LocalizedText }) {
  return (
    <fieldset className="rounded-card border border-line bg-white p-5">
      <legend className="px-1 text-sm font-semibold text-ink">النص البديل للإعلان</legend>
      <p className="mb-3 text-xs text-ink-faint">وصف قصير للصورة، يفيد محركات البحث وقارئات الشاشة.</p>
      <div className="grid gap-4">
        {locales.map((locale) => (
          <div key={locale}>
            <label htmlFor={`alt-${locale}`} className="text-xs font-medium text-ink-soft">
              {localeNames[locale]} <span className="text-ink-faint">— {localeHint[locale]}</span>
            </label>
            <input
              id={`alt-${locale}`}
              name={`alt.${locale}`}
              defaultValue={value[locale]}
              dir={locale === "ar" ? "rtl" : "ltr"}
              className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand-400"
            />
          </div>
        ))}
      </div>
    </fieldset>
  );
}

function ImageField({
  id,
  label,
  description,
  current,
  preview,
  onChoose,
  required,
}: {
  id: "desktopImage" | "mobileImage";
  label: string;
  description: string;
  current: string | null;
  preview: string | null;
  onChoose: (file: File | undefined) => void;
  required?: boolean;
}) {
  const image = preview || current;
  return (
    <fieldset className="rounded-card border border-line bg-white p-5">
      <legend className="px-1 text-sm font-semibold text-ink">
        {label}{required && <span className="text-red-600"> *</span>}
      </legend>
      <p className="mt-1 text-xs text-ink-faint">{description}</p>

      {image && (
        <div className="relative mt-4 aspect-[16/7] max-w-xl overflow-hidden rounded-lg bg-surface-2 ring-1 ring-line">
          {preview ? (
            // Local object URL; Next Image cannot optimise it.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, 576px" className="object-cover" />
          )}
        </div>
      )}

      <label htmlFor={id} className="mt-4 block text-xs font-medium text-ink-soft">
        {image ? "استبدال الصورة" : "اختيار صورة"}
      </label>
      <input
        id={id}
        name={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        required={required && !current}
        onChange={(event) => onChoose(event.target.files?.[0])}
        className="mt-1.5 block w-full cursor-pointer rounded-lg border border-dashed border-line bg-surface-2 px-3.5 py-3 text-sm text-ink-soft file:me-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
      />
      <p className="mt-1 text-xs text-ink-faint">JPG أو PNG أو WebP أو AVIF — حتى 5 ميغابايت.</p>
    </fieldset>
  );
}

export default function BannerForm({ banner }: { banner: StoredBanner | null }) {
  const [state, formAction, pending] = useActionState(saveBanner, initial);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);

  const setPreview = (file: File | undefined, set: (value: string | null) => void) => {
    if (file) set(URL.createObjectURL(file));
  };

  return (
    <form action={formAction} className="grid gap-6">
      {banner && <input type="hidden" name="id" value={banner.id} />}

      <ImageField
        id="desktopImage"
        label="صورة إعلان الحاسوب"
        description="يفضّل أن تكون أفقية، مثل 1600 × 700 بكسل. هذه الصورة تظهر من الشاشات المتوسطة وما فوق."
        current={banner?.desktopImage ?? null}
        preview={desktopPreview}
        required
        onChoose={(file) => setPreview(file, setDesktopPreview)}
      />

      <ImageField
        id="mobileImage"
        label="صورة إعلان الهاتف"
        description="يفضّل أن تكون عمودية، مثل 900 × 1200 بكسل. إن تركتها فارغة، سيستخدم الهاتف صورة الحاسوب."
        current={banner?.mobileImage ?? null}
        preview={mobilePreview}
        onChoose={(file) => setPreview(file, setMobilePreview)}
      />

      <AltFields value={banner?.alt ?? emptyLocalizedText()} />

      <fieldset className="rounded-card border border-line bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-ink">رابط الإعلان</legend>
        <label htmlFor="href" className="text-xs text-ink-soft">اختياري: رابط صفحة المنتج أو رابط خارجي أو ‎#products</label>
        <input
          id="href"
          name="href"
          defaultValue={banner?.href ?? ""}
          dir="ltr"
          placeholder="#products"
          className="mt-2 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand-400"
        />
      </fieldset>

      {state.error && <p role="alert" className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="cursor-pointer rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "جارٍ الحفظ…" : "حفظ الإعلان"}
        </button>
        <Link href="/admin/banners" className="rounded-lg px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-white hover:text-ink">إلغاء</Link>
      </div>
    </form>
  );
}
