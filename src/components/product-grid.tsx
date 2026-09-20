"use client";

import { useState } from "react";

import ProductCard from "@/components/product-card";
import ProductDialog from "@/components/product-dialog";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { ProductView } from "@/lib/view";

export default function ProductGrid({
  products,
  locale,
  dict,
  heading,
  eyebrow,
  headingId = "products-heading",
  labelledBy,
}: {
  products: ProductView[];
  locale: Locale;
  dict: Dictionary;
  heading?: string;
  /** Small-caps label set above the heading. */
  eyebrow?: string;
  headingId?: string;
  /** Set when the grid is the panel of a tablist. */
  labelledBy?: string;
}) {
  const [opened, setOpened] = useState<ProductView | null>(null);

  return (
    <>
      {heading && (
        <header className="mb-8 md:mb-10">
          {eyebrow && <p className="eyebrow mb-4 text-rose-ink">{eyebrow}</p>}
          <h2 id={headingId} className="text-[clamp(2.2rem,4vw,3.65rem)]">
            {heading}
          </h2>
        </header>
      )}

      {products.length === 0 ? (
        <p className="py-12 text-center text-ink-soft">{dict.productsPage.empty}</p>
      ) : (
        <div
          id="product-panel"
          role={labelledBy ? "tabpanel" : undefined}
          aria-labelledby={labelledBy}
          tabIndex={labelledBy ? -1 : undefined}
          className="grid gap-[22px] md:grid-cols-2 md:gap-[25px]"
        >
          {products.map((product, i) => (
            <div
              key={product.id}
              className="animate-[fade-up_0.45s_cubic-bezier(0.22,1,0.36,1)_both]"
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <ProductCard
                product={product}
                locale={locale}
                index={i}
                ctaLabel={dict.product.details}
                onOpen={setOpened}
              />
            </div>
          ))}
        </div>
      )}

      <ProductDialog
        product={opened}
        locale={locale}
        dict={dict}
        onClose={() => setOpened(null)}
      />
    </>
  );
}
