import ProductCard from "@/components/product-card";
import type { Locale } from "@/i18n/config";
import type { ProductView } from "@/lib/view";

export default function ProductGrid({
  products,
  locale,
  heading,
  emptyLabel,
  cardSize = "default",
  headingId = "products-heading",
  labelledBy,
}: {
  products: ProductView[];
  locale: Locale;
  heading?: string;
  emptyLabel: string;
  cardSize?: "default" | "large";
  headingId?: string;
  /** Set when the grid is the panel of a tablist. */
  labelledBy?: string;
}) {
  return (
    <>
      {heading && (
        <h2
          id={headingId}
          className="mb-9 text-center text-2xl font-bold text-brand-600 md:mb-12 md:text-[2rem]"
        >
          {heading}
        </h2>
      )}

      {products.length === 0 ? (
        <p className="py-12 text-center text-ink-soft">{emptyLabel}</p>
      ) : (
        <div
          id="product-panel"
          role={labelledBy ? "tabpanel" : undefined}
          aria-labelledby={labelledBy}
          tabIndex={labelledBy ? -1 : undefined}
          className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 md:gap-y-14 lg:grid-cols-3"
        >
          {products.map((product, i) => (
            <div
              key={product.id}
              className="animate-[fade-up_0.45s_cubic-bezier(0.22,0.8,0.3,1)_both]"
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <ProductCard product={product} locale={locale} size={cardSize} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
