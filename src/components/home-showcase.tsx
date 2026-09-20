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
        The banner sits on the ivory page inside a soft-cornered frame rather
        than bleeding to the edges — the oversized top-start radius is the
        signature shape of the identity.
      */}
      {/* Near full bleed: the banner runs the width of the window, held off
          the edge by a hairline gutter so it reads as a panel on the page. */}
      <div className="w-full px-3 pt-6 pb-8 sm:px-4 md:pt-8 md:pb-10 lg:px-6">
        <HeroCarousel slides={slides} dict={dict} />
      </div>

      <CategoryStrip
        categories={categories}
        dict={dict}
        active={active}
        onSelect={setActive}
      />

      <section
        id="products"
        aria-labelledby="products-heading"
        className="container-page section-space"
      >
        <ProductGrid
          key={active}
          products={shown}
          locale={locale}
          heading={activeLabel}
          eyebrow={dict.productsPage.title}
          dict={dict}
          labelledBy={`tab-${active}`}
        />
      </section>
    </>
  );
}
