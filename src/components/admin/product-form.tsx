"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";

import { saveProduct, type ActionState } from "@/app/admin/actions";
import { locales, localeNames, type Locale } from "@/i18n/config";
import type { LocalizedText, StoredCategory, StoredProduct } from "@/lib/content-types";
import { emptyLocalizedText } from "@/lib/content-types";

const initial: ActionState = {};

const LOCALE_HINT: Record<Locale, string> = {
  fr: "اللغة الافتراضية للموقع",
  ar: "تظهر عند اختيار العربية",
  en: "تظهر عند اختيار الإنجليزية",
};

/* -------------------------------------------------------------------------- */

function LocalizedField({
  field,
  label,
  value,
  multiline = false,
  required = false,
}: {
  field: string;
  label: string;
  value: LocalizedText;
  multiline?: boolean;
  required?: boolean;
}) {
  return (
    <fieldset className="rounded-card border border-line bg-white p-5">
      <legend className="px-1 text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </legend>

      <div className="mt-2 grid gap-4">
        {locales.map((locale) => {
          const id = `${field}-${locale}`;
          const rtl = locale === "ar";
          return (
            <div key={locale}>
              <label
                htmlFor={id}
                className="flex items-baseline gap-2 text-xs font-medium text-ink-soft"
              >
                <span className="rounded bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-700 uppercase">
                  {locale}
                </span>
                <span>{localeNames[locale]}</span>
                <span className="text-ink-faint">— {LOCALE_HINT[locale]}</span>
              </label>

              {multiline ? (
                <textarea
                  id={id}
                  name={`${field}.${locale}`}
                  defaultValue={value[locale]}
                  rows={3}
                  dir={rtl ? "rtl" : "ltr"}
                  className="mt-1.5 w-full resize-y rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm leading-relaxed text-ink outline-none transition-colors duration-200 focus:border-brand-400"
                />
              ) : (
                <input
                  id={id}
                  name={`${field}.${locale}`}
                  defaultValue={value[locale]}
                  dir={rtl ? "rtl" : "ltr"}
                  className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors duration-200 focus:border-brand-400"
                />
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

/* -------------------------------------------------------------------------- */

export default function ProductForm({
  product,
  categories,
}: {
  product: StoredProduct | null;
  categories: StoredCategory[];
}) {
  const [state, formAction, pending] = useActionState(saveProduct, initial);

  /** Existing images, reorderable and removable before saving. */
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  /** Object URLs for files chosen in this session, purely for preview. */
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const onFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    previews.forEach(URL.revokeObjectURL);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  return (
    <form action={formAction} className="grid gap-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      <LocalizedField
        field="name"
        label="اسم المنتج"
        value={product?.name ?? emptyLocalizedText()}
        required
      />

      <LocalizedField
        field="description"
        label="وصف المنتج"
        value={product?.description ?? emptyLocalizedText()}
        multiline
      />

      <LocalizedField
        field="line"
        label="المجموعة (تظهر أسفل صورة المنتج)"
        value={product?.line ?? emptyLocalizedText()}
      />

      {/* --- size + slug --------------------------------------------------- */}
      <fieldset className="rounded-card border border-line bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-ink">الحجم والرابط</legend>

        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="volumeMl" className="text-xs font-medium text-ink-soft">
              الحجم بالمليلتر (ml)
            </label>
            <input
              id="volumeMl"
              name="volumeMl"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              defaultValue={product?.volumeMl ?? ""}
              placeholder="400"
              dir="ltr"
              className="tabular mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-start text-sm text-ink outline-none transition-colors duration-200 focus:border-brand-400"
            />
            <p className="mt-1 text-xs text-ink-faint">
              يظهر في بطاقة المنتج وفي صفحة التفاصيل. اتركه فارغًا للمنتجات التي
              لا تُقاس بالمليلتر.
            </p>
          </div>

          <div>
            <label htmlFor="slug" className="text-xs font-medium text-ink-soft">
              رابط المنتج (slug)
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={product?.slug ?? ""}
              placeholder="shampooing-nutritif"
              dir="ltr"
              className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-start text-sm text-ink outline-none transition-colors duration-200 focus:border-brand-400"
            />
            <p className="mt-1 text-xs text-ink-faint">
              يُولَّد تلقائيًا من الاسم الفرنسي إذا تُرك فارغًا.
            </p>
          </div>
        </div>
      </fieldset>

      {/* --- categories ---------------------------------------------------- */}
      <fieldset className="rounded-card border border-line bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-ink">الفئات</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((category) => {
            const checked = product?.categoryIds.includes(category.id) ?? false;
            return (
              <label
                key={category.id}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors duration-200 has-checked:border-brand-600 has-checked:bg-brand-50 has-checked:font-semibold has-checked:text-brand-700"
              >
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={category.id}
                  defaultChecked={checked}
                  className="size-4 accent-brand-600"
                />
                {category.label.ar || category.label.fr}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* --- images -------------------------------------------------------- */}
      <fieldset className="rounded-card border border-line bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-ink">صور المنتج</legend>
        <p className="mt-1 text-xs text-ink-faint">
          الصورة الأولى هي الصورة الرئيسية. رتّبها بالأسهم؛ الباقي يظهر كمصغّرات
          تحت الصورة في صفحة المنتج.
        </p>

        {images.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-3">
            {images.map((url, i) => (
              <li key={url} className="w-28">
                <input type="hidden" name="existingImages" value={url} />

                <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-2 ring-1 ring-line">
                  <Image src={url} alt="" fill sizes="112px" className="object-cover" />
                  {i === 0 && (
                    <span className="absolute inset-x-0 bottom-0 bg-brand-600/90 py-1 text-center text-[0.625rem] font-semibold text-white">
                      رئيسية
                    </span>
                  )}
                </div>

                <div className="mt-1.5 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    aria-label="تقديم"
                    className="cursor-pointer rounded px-2 py-1 text-xs text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                    className="cursor-pointer rounded px-2 py-1 text-xs text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    حذف
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    disabled={i === images.length - 1}
                    aria-label="تأخير"
                    className="cursor-pointer rounded px-2 py-1 text-xs text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4">
          <label htmlFor="images" className="text-xs font-medium text-ink-soft">
            إضافة صور
          </label>
          <input
            ref={fileInput}
            id="images"
            name="images"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={onFilesChosen}
            className="mt-1.5 block w-full cursor-pointer rounded-lg border border-dashed border-line bg-surface-2 px-3.5 py-3 text-sm text-ink-soft file:me-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
          />
          <p className="mt-1 text-xs text-ink-faint">
            JPG أو PNG أو WebP أو AVIF — 5 ميغابايت كحد أقصى للصورة الواحدة.
          </p>

          {previews.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-3">
              {previews.map((url) => (
                <li
                  key={url}
                  className="relative size-20 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-brand-200"
                >
                  {/* Local object URL — next/image would try to optimise it. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="size-full object-cover" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </fieldset>

      {state.error && (
        <p
          role="alert"
          className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "جارٍ الحفظ…" : "حفظ"}
        </button>

        <Link
          href="/admin"
          className="rounded-lg px-4 py-3 text-sm font-medium text-ink-soft transition-colors duration-200 hover:bg-white hover:text-ink"
        >
          إلغاء
        </Link>
      </div>
    </form>
  );
}
