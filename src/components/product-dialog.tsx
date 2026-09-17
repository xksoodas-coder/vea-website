"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ArrowUpLeft, Close } from "@/components/icons";
import { type Dictionary, fill } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { ProductView } from "@/lib/view";

/**
 * Product quick view.
 *
 * A native <dialog> in the top layer: Escape, focus trapping and inertness
 * behind the backdrop are the browser's job, and the fade/lift is done in
 * CSS (`.product-dialog` in globals.css) so it plays on close as well as on
 * open. The element stays mounted and empty between openings — React keeps
 * the ref stable, and `showModal()` is what actually reveals it.
 */
export default function ProductDialog({
  product,
  locale,
  dict,
  onClose,
}: {
  product: ProductView | null;
  locale: Locale;
  dict: Dictionary;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (product && !el.open) {
      setIndex(0);
      el.showModal();
    } else if (!product && el.open) {
      el.close();
    }
  }, [product]);

  /* Clicking the backdrop — i.e. the dialog box itself, outside its card. */
  const onBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) onClose();
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={onBackdropClick}
      aria-label={product?.name}
      className="product-dialog m-auto max-h-[90dvh] w-[min(940px,92vw)] overflow-hidden rounded-card border-0 bg-ivory p-0 text-plum shadow-[0_30px_150px_rgb(41_23_32_/_0.4)]"
    >
      {product && (
        <div className="grid max-h-[90dvh] overflow-auto overscroll-contain md:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.a11y.close}
            className="absolute end-3.5 top-3.5 z-2 grid size-11 cursor-pointer place-items-center rounded-full border border-line-strong bg-ivory text-plum transition-colors duration-300 hover:bg-blush"
          >
            <Close className="size-5" />
          </button>

          {/* -------- Visual -------- */}
          <div className="flex flex-col justify-center bg-white">
            <Image
              key={product.images[index]}
              src={product.images[index]}
              alt={product.name}
              width={700}
              height={700}
              className="h-[300px] w-full object-contain md:h-[435px]"
            />

            {product.images.length > 1 && (
              <div className="flex items-center justify-center gap-2.5 px-5 pb-5">
                {product.images.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-pressed={i === index}
                    aria-label={fill(dict.a11y.showImage, { index: i + 1 })}
                    className={`size-14 cursor-pointer overflow-hidden rounded-[9px] bg-white p-[3px] transition-colors duration-200 md:size-16 ${
                      i === index
                        ? "border-2 border-plum"
                        : "border border-line-strong hover:border-plum/50"
                    }`}
                  >
                    <Image
                      src={src}
                      alt=""
                      width={80}
                      height={80}
                      className="size-full rounded-[5px] object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* -------- Copy -------- */}
          <div className="px-6 pt-8 pb-9 md:px-8 md:pt-14 md:pb-10">
            {product.line && (
              <p className="eyebrow mb-4 text-rose-ink">{product.line}</p>
            )}

            <h2 className="text-[clamp(2rem,4vw,2.5rem)]">{product.name}</h2>

            {product.size && (
              <p className="tabular mt-4 inline-block rounded-[5px] bg-[#e8edde] px-2.5 py-1 text-sm text-[#3c4736]">
                {product.size}
              </p>
            )}

            {product.description && (
              <p className="mt-5 leading-[1.8] text-ink-soft">{product.description}</p>
            )}

            {product.line && (
              <div className="mt-6 flex items-center justify-between gap-3.5 border-y border-line py-4 text-sm">
                <span className="text-ink-soft">{dict.product.range}</span>
                <span className="font-medium">{product.line}</span>
              </div>
            )}

            <Link
              href={`/${locale}/products/${product.slug}`}
              className="btn btn-dark mt-6 w-full justify-between"
            >
              {dict.product.details}
              <ArrowUpLeft className="size-5 -scale-x-100 rtl:scale-x-100" />
            </Link>
          </div>
        </div>
      )}
    </dialog>
  );
}
