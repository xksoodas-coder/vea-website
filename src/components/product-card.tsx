import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/i18n/config";
import type { ProductView } from "@/lib/view";

export default function ProductCard({
  product,
  locale,
  ctaLabel,
  size = "default",
}: {
  product: ProductView;
  locale: Locale;
  /** Text of the quick-view bar, e.g. "Détails du produit". */
  ctaLabel: string;
  /** "large" is used on the products page, where cards get more room. */
  size?: "default" | "large";
}) {
  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="group flex h-full flex-col focus-visible:outline-offset-4"
    >
      {/* Soft-cornered image plate. */}
      <div
        className={`relative isolate overflow-hidden rounded-[15px] bg-surface-2 md:rounded-plate ${
          size === "large" ? "aspect-square" : "aspect-11/13"
        }`}
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[850ms] ease-out-soft group-hover:scale-[1.06]"
        />

        {/*
          Quick-view bar. Always visible on touch, where there is no hover to
          reveal it; from `md` up it slides in with the cursor.
        */}
        <span className="absolute inset-x-2.5 bottom-2.5 flex min-h-[37px] items-center justify-between gap-2 rounded-lg bg-ivory/95 px-3 py-2 text-xs backdrop-blur-[5px] transition-[opacity,transform] duration-[400ms] ease-out-soft md:inset-x-3 md:bottom-3 md:translate-y-3.5 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100">
          {ctaLabel}
          <span aria-hidden="true" className="text-xl leading-none">
            +
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <p className="mb-2 flex justify-between gap-2 text-xs tracking-[0.05em] text-ink-soft">
          <span className="truncate uppercase">{product.line}</span>
          {product.size && (
            <span className="tabular shrink-0 tracking-normal">{product.size}</span>
          )}
        </p>

        <h3 className="mb-2 text-xl leading-snug tracking-[-0.035em] transition-colors duration-300 group-hover:text-rose-ink md:text-[1.45rem] lg:text-[1.6rem]">
          {product.name}
        </h3>

        {product.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">
            {product.description}
          </p>
        )}
      </div>
    </Link>
  );
}
