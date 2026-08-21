"use client";

import { locales, localeNames, type Locale } from "@/i18n/config";
import type { LocalizedText } from "@/lib/content-types";

/** Arabic names for the three site languages, for the dashboard's own labels. */
export const localeHint: Record<Locale, string> = {
  fr: "الفرنسية",
  ar: "العربية",
  en: "الإنجليزية",
};

export const inputClass =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand-400";

/** A titled panel — the dashboard's one grouping element. */
export function Card({
  title,
  hint,
  children,
  actions,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-card border border-line bg-white p-5">
      <legend className="px-1 text-sm font-semibold text-ink">{title}</legend>
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
      <div className="mt-4">{children}</div>
      {actions && <div className="mt-4">{actions}</div>}
    </fieldset>
  );
}

type LocalizedFieldProps = {
  /** Form field prefix; inputs are named `${name}.fr`, `${name}.ar`, … */
  name: string;
  label: string;
  value: LocalizedText;
  hint?: string;
  /** Multi-line when set — blank lines become paragraphs on the site. */
  rows?: number;
  required?: boolean;
};

/** One labelled row of inputs, one per site language. */
export function LocalizedField({
  name,
  label,
  value,
  hint,
  rows,
  required,
}: LocalizedFieldProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink">
        {label} {required && <span className="text-red-600">*</span>}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}

      <div className="mt-3 grid gap-3">
        {locales.map((locale) => {
          const id = `${name}-${locale}`;
          const dir = locale === "ar" ? "rtl" : "ltr";
          return (
            <div key={locale}>
              <label htmlFor={id} className="text-xs font-medium text-ink-soft">
                {localeNames[locale]}{" "}
                <span className="text-ink-faint">— {localeHint[locale]}</span>
              </label>
              {rows ? (
                <textarea
                  id={id}
                  name={`${name}.${locale}`}
                  defaultValue={value[locale]}
                  dir={dir}
                  rows={rows}
                  className={`mt-1.5 ${inputClass} leading-relaxed`}
                />
              ) : (
                <input
                  id={id}
                  name={`${name}.${locale}`}
                  defaultValue={value[locale]}
                  dir={dir}
                  className={`mt-1.5 ${inputClass}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact variant used inside repeatable rows: no per-language labels, just
 * the three inputs side by side with the language code as a placeholder.
 */
export function LocalizedRowInputs({
  name,
  value,
  placeholder,
}: {
  name: string;
  value: LocalizedText;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {locales.map((locale) => (
        <input
          key={locale}
          name={`${name}.${locale}`}
          defaultValue={value[locale]}
          dir={locale === "ar" ? "rtl" : "ltr"}
          placeholder={placeholder ? `${placeholder} — ${localeNames[locale]}` : localeNames[locale]}
          aria-label={`${placeholder ?? name} — ${localeNames[locale]}`}
          className={inputClass}
        />
      ))}
    </div>
  );
}

export function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
    >
      {message}
    </p>
  );
}

export function SubmitBar({
  pending,
  label,
  pendingLabel,
  cancelHref,
  children,
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
  cancelHref?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? pendingLabel : label}
      </button>
      {cancelHref && (
        <a
          href={cancelHref}
          className="rounded-lg px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-white hover:text-ink"
        >
          إلغاء
        </a>
      )}
      {children}
    </div>
  );
}

/** Add / remove buttons shared by every repeatable list. */
export function RowTools({
  onRemove,
  removeLabel = "حذف السطر",
}: {
  onRemove: () => void;
  removeLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={removeLabel}
      title={removeLabel}
      className="shrink-0 cursor-pointer rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink-faint transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
    >
      حذف
    </button>
  );
}

export function AddRowButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-dashed border-line bg-surface-2 px-4 py-2.5 text-sm font-semibold text-brand-600 transition-colors hover:border-brand-200 hover:bg-brand-50"
    >
      + {label}
    </button>
  );
}

/** Show / hide switch used by team members and gallery items. */
export function VisibleToggle({ defaultChecked }: { defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-white p-4">
      <input
        type="checkbox"
        name="visible"
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 cursor-pointer accent-brand-600"
      />
      <span>
        <span className="block text-sm font-semibold text-ink">
          إظهار في صفحة «عن شركتنا»
        </span>
        <span className="mt-0.5 block text-xs text-ink-faint">
          أزل العلامة لإخفائه عن الزوار مع الاحتفاظ به في لوحة التحكم.
        </span>
      </span>
    </label>
  );
}

/** Display order — smaller numbers come first. */
export function SortOrderField({ defaultValue }: { defaultValue: number }) {
  return (
    <div>
      <label htmlFor="sortOrder" className="text-sm font-semibold text-ink">
        ترتيب العرض
      </label>
      <p className="mt-1 text-xs text-ink-faint">
        الرقم الأصغر يظهر أولاً. اتركه 0 ليأتي حسب تاريخ الإضافة.
      </p>
      <input
        id="sortOrder"
        name="sortOrder"
        type="number"
        step="1"
        defaultValue={defaultValue}
        dir="ltr"
        className={`mt-2 ${inputClass} max-w-32 text-start`}
      />
    </div>
  );
}
