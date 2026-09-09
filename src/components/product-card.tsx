import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/i18n/config";
import type { ProductView } from "@/lib/view";

export default function ProductCard({
  product,
  locale,
  size = "default",
}: {
  product: ProductView;
  locale: Locale;
  /** "large" is used on the products page, where cards get more room. */
  size?: "default" | "large";
}) {
  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="group flex flex-col focus-visible:outline-offset-4"
    >
      {/* Square-cornered image plate — no rounding. */}
      <div
        className={`relative overflow-hidden bg-surface-2 ${
          size === "large" ? "aspect-square" : "aspect-11/13"
        }`}
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,0.8,0.3,1)] group-hover:scale-[1.035]"
        />

        {/* Range label, pinned to the bottom edge of the plate. */}
        {product.line && (
          <p className="absolute inset-x-0 bottom-0 bg-brand-50/95 py-2.5 text-center text-[0.6875rem] font-semibold tracking-[0.14em] text-brand-700 uppercase backdrop-blur-sm">
            {product.line}
          </p>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-4 pt-4">
        <h3 className="text-base leading-snug font-medium text-ink transition-colors duration-200 group-hover:text-brand-600 md:text-lg">
          {product.name}
        </h3>
        {product.size && (
          <p className="tabular shrink-0 text-sm text-ink-soft">{product.size}</p>
        )}
      </div>
    </Link>
  );
}
