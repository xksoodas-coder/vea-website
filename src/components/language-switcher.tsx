"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ChevronDown, Globe } from "@/components/icons";
import {
  type Locale,
  localeNames,
  localeShortNames,
  locales,
} from "@/i18n/config";

type Props = {
  locale: Locale;
  label: string;
};

export default function LanguageSwitcher({ locale, label }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  /* Close on outside click and on Escape. */
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className="flex h-11 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-ink-soft transition-colors duration-200 hover:bg-brand-50 hover:text-brand-600"
      >
        <Globe className="size-[1.125rem]" />
        <span className="tabular">{localeShortNames[locale]}</span>
        <ChevronDown
          className={`size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute end-0 top-full z-50 mt-1 min-w-[9.5rem] overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lift"
        >
          {locales.map((code) => {
            const isCurrent = code === locale;
            return (
              <li key={code} role="none">
                <Link
                  href={`/${code}`}
                  role="menuitem"
                  hrefLang={code}
                  lang={code}
                  dir={code === "ar" ? "rtl" : "ltr"}
                  aria-current={isCurrent ? "true" : undefined}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-2.5 text-start text-sm transition-colors duration-150 ${
                    isCurrent
                      ? "bg-brand-50 font-semibold text-brand-600"
                      : "font-medium text-ink hover:bg-brand-50 hover:text-brand-600"
                  }`}
                >
                  {localeNames[code]}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
