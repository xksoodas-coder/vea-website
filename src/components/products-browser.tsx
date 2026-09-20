"use client";

import { useState } from "react";

import ProductGrid from "@/components/product-grid";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { CategoryView, ProductView } from "@/lib/view";

/**
 * Products page: category filter across the top, grid below.
 * A plain pill row rather than the homepage's round strip — this page is a
 * catalogue, so the filter should stay out of the way of the products.
 */
export default function ProductsBrowser({
  categories,
  products,
  locale,
  dict,
}: {
  categories: CategoryView[];
  products: ProductView[];
  locale: Locale;
  dict: Dictionary;
}) {
  const ALL = "__all__";
  const [active, setActive] = useState(ALL);

  const shown =
    active === ALL ? products : products.filter((p) => p.categoryIds.includes(active));

  const tabs = [{ id: ALL, label: dict.productsPage.all }, ...categories];

  return (
    <>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3.5">
        {/* Segmented pill group, on its own blush track. */}
        <div
          role="tablist"
          aria-label={dict.a11y.categories}
          className="no-scrollbar flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full border border-[#ece1df] bg-[#f0e8e6] p-[5px]"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === active;
            const count =
              tab.id === ALL
                ? products.length
                : products.filter((p) => p.categoryIds.includes(tab.id)).length;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`ptab-${tab.id}`}
                aria-selected={isActive}
                aria-controls="product-panel"
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(tab.id)}
                className={`min-h-11 cursor-pointer rounded-full border-0 px-3 py-2.5 text-[0.8125rem] whitespace-nowrap transition-[background-color,color,box-shadow] duration-300 sm:px-4.5 sm:text-sm ${
                  isActive
                    ? "bg-plum text-ivory shadow-[0_3px_10px_rgb(73_44_64_/_0.08)]"
                    : "bg-transparent text-plum hover:bg-[#e7d6dc]"
                }`}
              >
                {tab.label}
                <span className="tabular ms-1.5 text-xs opacity-80">{count}</span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-ink-soft">
          {shown.length} · {dict.productsPage.title}
        </p>
      </div>

      <ProductGrid
        key={active}
        products={shown}
        locale={locale}
        dict={dict}
        labelledBy={`ptab-${active}`}
      />
    </>
  );
}
