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
      <div
        role="tablist"
        aria-label={dict.a11y.categories}
        className="no-scrollbar mb-10 flex justify-start gap-2 overflow-x-auto md:mb-14 md:justify-center"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
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
              className={`cursor-pointer rounded-full border px-4 py-2.5 text-sm whitespace-nowrap transition-colors duration-200 md:px-5 ${
                isActive
                  ? "border-brand-600 bg-brand-600 font-semibold text-white"
                  : "border-line bg-white font-medium text-ink-soft hover:border-brand-200 hover:text-brand-600"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <ProductGrid
        key={active}
        products={shown}
        locale={locale}
        emptyLabel={dict.productsPage.empty}
        cardSize="large"
        labelledBy={`ptab-${active}`}
      />
    </>
  );
}
