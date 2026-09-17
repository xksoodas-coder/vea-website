import ProductCard from "@/components/product-card";
import type { Locale } from "@/i18n/config";
import type { ProductView } from "@/lib/view";

export default function ProductGrid({
  products,
  locale,
  heading,
  eyebrow,
  ctaLabel,
  emptyLabel,
  cardSize = "default",
  headingId = "products-heading",
  labelledBy,
}: {
  products: ProductView[];
  locale: Locale;
  heading?: string;
  /** Small-caps label set above the heading. */
  eyebrow?: string;
  ctaLabel: string;
  emptyLabel: string;
  cardSize?: "default" | "large";
  headingId?: string;
  /** Set when the grid is the panel of a tablist. */
  labelledBy?: string;
}) {
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
        <p className="py-12 text-center text-ink-soft">{emptyLabel}</p>
      ) : (
        <div
          id="product-panel"
          role={labelledBy ? "tabpanel" : undefined}
          aria-labelledby={labelledBy}
          tabIndex={labelledBy ? -1 : undefined}
          className="grid grid-cols-2 gap-x-3.5 gap-y-7 sm:gap-x-6 sm:gap-y-9 md:grid-cols-3 md:gap-x-7 md:gap-y-11 lg:gap-x-[30px] lg:gap-y-[45px]"
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
                ctaLabel={ctaLabel}
                size={cardSize}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
