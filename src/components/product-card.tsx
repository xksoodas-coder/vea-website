"use client";

import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/i18n/config";
import type { ProductView } from "@/lib/view";

export default function ProductCard({
  product,
  locale,
  onOpen,
  size = "default",
}: {
  product: ProductView;
  locale: Locale;
  /** Opens the quick-view dialog for this product. */
  onOpen: (product: ProductView) => void;
  /** "large" is used on the products page, where cards get more room. */
  size?: "default" | "large";
}) {
  /*
    A real link to the product page — so it can be opened in a new tab and
    crawled — that opens the dialog on a plain left click instead.
  */
  const onClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onOpen(product);
  };

  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      onClick={onClick}
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
