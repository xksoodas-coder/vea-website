"use client";

import { useState } from "react";

import CategoryStrip from "@/components/category-strip";
import HeroCarousel from "@/components/hero-carousel";
import ProductGrid from "@/components/product-grid";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { CategoryView, ProductView, SlideView } from "@/lib/view";

export default function HomeShowcase({
  slides,
  categories,
  products,
  locale,
  dict,
}: {
  slides: SlideView[];
  categories: CategoryView[];
  products: ProductView[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const shown = products.filter((p) => p.categoryIds.includes(active));
  const activeLabel = categories.find((c) => c.id === active)?.label ?? "";

  return (
    <>
      {/*
        First screen: banner and category strip split the viewport 67/33 at
        any size. `dvh` so mobile browser chrome doesn't clip it; the
        min-height keeps both readable on very short windows.
      */}
      <div className="h-[calc(100dvh-4rem)] min-h-[34rem]">
        <HeroCarousel slides={slides} dict={dict} />
        <CategoryStrip
          categories={categories}
          dict={dict}
          active={active}
          onSelect={setActive}
        />
      </div>

      <section id="products" aria-labelledby="products-heading" className="py-14 md:py-20">
        {/* Wider than `container-page` so the three cards read at full size. */}
        <div className="mx-auto w-full max-w-[86rem] px-5 md:px-8">
          <ProductGrid
            key={active}
            products={shown}
            locale={locale}
            heading={activeLabel}
            emptyLabel={dict.productsPage.empty}
            labelledBy={`tab-${active}`}
          />
        </div>
      </section>
    </>
  );
}
