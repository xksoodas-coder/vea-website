"use client";

import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import type { ProductView } from "@/lib/view";

/**
 * Split panel: the copy sits on a tinted half, the photograph fills the
 * other and carries one oversized corner that cuts into it.
 *
 * Cards alternate between the two brand tints, and the cut corner alternates
 * with them — top-start on the sage panels, bottom-start on the blush ones —
 * so a grid of them reads as a rhythm rather than a repeat.
 */
export default function ProductCard({
  product,
  locale,
  index,
  ctaLabel,
  onOpen,
}: {
  product: ProductView;
  locale: Locale;
  /** Position in the grid: drives the numbering and the alternating tint. */
  index: number;
  ctaLabel: string;
  /** Opens the quick-view dialog for this product. */
  onOpen: (product: ProductView) => void;
}) {
  const sage = index % 2 === 0;

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
      className={`group isolate grid min-h-[310px] grid-cols-2 overflow-hidden rounded-card focus-visible:outline-offset-4 sm:min-h-[340px] lg:min-h-[380px] ${
        sage ? "bg-[#e6eddf]" : "bg-[#f2e0e3]"
      }`}
    >
      {/* -------- Copy -------- */}
      <div className="z-1 flex flex-col items-start py-7 pe-0 ps-5 sm:py-8 sm:ps-7 lg:ps-8">
        <p className="mb-4 text-xs tracking-[0.055em] text-ink-soft uppercase lg:mb-5">
          <span className="tabular">{String(index + 1).padStart(2, "0")}</span>
          {product.line && ` / ${product.line}`}
        </p>

        <h3 className="mb-4 text-[clamp(1.35rem,2.3vw,2.2rem)] leading-[1.1] tracking-[-0.055em] text-balance">
          {product.name}
        </h3>

        {product.description && (
          <p className="mb-5 line-clamp-3 text-sm leading-[1.7] text-ink-soft lg:text-[0.9375rem]">
            {product.description}
          </p>
        )}

        <span className="mt-auto flex items-center gap-2 text-[0.8125rem] leading-snug font-medium lg:gap-3">
          {ctaLabel}
          <ArrowRight className="size-[18px] shrink-0 transition-transform duration-[400ms] ease-out-soft group-hover:translate-x-[5px] rtl:-scale-x-100" />
        </span>
      </div>

      {/* -------- Photograph -------- */}
      <div
        className={`relative ms-1.5 overflow-hidden ${
          sage ? "mt-6 rounded-ss-[90px] lg:mt-8" : "mb-6 rounded-es-[90px] lg:mb-8"
        }`}
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover transition-transform duration-[900ms] ease-out-soft group-hover:scale-[1.045]"
        />

        {product.size && (
          <span className="tabular absolute end-3 top-3 rounded-full border border-ivory/40 bg-ivory/90 px-2.5 py-1 text-xs leading-snug">
            {product.size}
          </span>
        )}
      </div>
    </Link>
  );
}
