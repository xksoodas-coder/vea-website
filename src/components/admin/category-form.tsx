"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";

import { saveCategory, type ActionState } from "@/app/admin/actions";
import { locales, localeNames, type Locale } from "@/i18n/config";
import {
  emptyLocalizedText,
  type LocalizedText,
  type StoredCategory,
} from "@/lib/content-types";

const initial: ActionState = {};

const localeHint: Record<Locale, string> = {
  fr: "الفرنسية",
  ar: "العربية",
  en: "الإنجليزية",
};

function LocalizedNameFields({ value }: { value: LocalizedText }) {
  return (
    <fieldset className="rounded-card border border-line bg-white p-5">
      <legend className="px-1 text-sm font-semibold text-ink">
        اسم الفئة <span className="text-red-600">*</span>
      </legend>
      <p className="mt-1 text-xs text-ink-faint">
        اكتب الاسم بلغة واحدة على الأقل؛ الموقع يستعمل اللغات الأخرى المتاحة كبديل.
      </p>
      <div className="mt-4 grid gap-4">
        {locales.map((locale) => (
          <div key={locale}>
            <label htmlFor={`label-${locale}`} className="text-xs font-medium text-ink-soft">
              {localeNames[locale]} <span className="text-ink-faint">— {localeHint[locale]}</span>
            </label>
            <input
              id={`label-${locale}`}
              name={`label.${locale}`}
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

export default function CategoryForm({ category }: { category: StoredCategory | null }) {
  const [state, formAction, pending] = useActionState(saveCategory, initial);
  const [preview, setPreview] = useState<string | null>(null);
  const image = preview || category?.image || null;

  return (
    <form action={formAction} className="grid gap-6">
      {category && <input type="hidden" name="id" value={category.id} />}

      <LocalizedNameFields value={category?.label ?? emptyLocalizedText()} />

      <fieldset className="rounded-card border border-line bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-ink">معرّف الفئة في الرابط</legend>
        <label htmlFor="categoryId" className="text-xs text-ink-soft">
          {category
            ? "المعرّف ثابت بعد الإنشاء حتى لا تنقطع روابط المنتجات المرتبطة بهذه الفئة."
            : "اختياري. اتركه فارغاً ليُنشأ تلقائياً من اسم الفئة."}
        </label>
        <input
          id="categoryId"
          name="categoryId"
          defaultValue={category?.id ?? ""}
          disabled={Boolean(category)}
          dir="ltr"
          placeholder="hair-care"
          className="mt-2 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand-400 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-faint"
        />
      </fieldset>

      <fieldset className="rounded-card border border-line bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-ink">صورة الفئة</legend>
        <p className="mt-1 text-xs text-ink-faint">
          اختيارية. استعمل صورة مربعة أو قريبة من المربع لعرض أجمل في بطاقات الفئات.
        </p>
        {image && (
          <div className="relative mt-4 size-36 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-line">
            {preview ? (
              // Local object URLs are not supported by next/image optimisation.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="size-full object-cover" />
            ) : (
              <Image src={image} alt="" fill sizes="144px" className="object-cover" />
            )}
          </div>
        )}
        <label htmlFor="image" className="mt-4 block text-xs font-medium text-ink-soft">
          {image ? "استبدال الصورة" : "اختيار صورة"}
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
          className="mt-1.5 block w-full cursor-pointer rounded-lg border border-dashed border-line bg-surface-2 px-3.5 py-3 text-sm text-ink-soft file:me-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
        />
        <p className="mt-1 text-xs text-ink-faint">JPG أو PNG أو WebP أو AVIF — حتى 5 ميغابايت.</p>
      </fieldset>

      {state.error && (
        <p role="alert" className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="cursor-pointer rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "جارٍ الحفظ…" : "حفظ الفئة"}
        </button>
        <Link href="/admin/categories" className="rounded-lg px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-white hover:text-ink">
          إلغاء
        </Link>
      </div>
    </form>
  );
}
