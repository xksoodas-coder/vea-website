"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChevronLeft, ChevronRight } from "@/components/icons";
import { type Dictionary, fill } from "@/i18n";

/**
 * Main image with thumbnails underneath.
 *
 * Every image is mounted and crossfaded rather than swapping `src`, so moving
 * between views never shows a blank frame while the next file decodes.
 */
export default function ProductGallery({
  images,
  alt,
  dict,
}: {
  images: string[];
  alt: string;
  dict: Dictionary;
}) {
  const [index, setIndex] = useState(0);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const count = images.length;
  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  /* Keep the active thumbnail in view when the strip scrolls. */
  useEffect(() => {
    const el = thumbRefs.current[index];
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [index]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (count < 2) return;
    const rtl = document.documentElement.dir === "rtl";
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(rtl ? index + 1 : index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(rtl ? index - 1 : index + 1);
    }
  };

  return (
    <div
      className="flex flex-col gap-4"
      onKeyDown={onKeyDown}
      role="group"
      aria-label={dict.a11y.productImages}
    >
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-[18px] bg-surface-2">
        {images.map((src, i) => (
          <Image
            key={src + i}
            src={src}
            alt={i === 0 ? alt : ""}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 46vw, 100vw"
            aria-hidden={i !== index}
            className={`object-cover transition-opacity duration-400 ease-[cubic-bezier(0.22,0.8,0.3,1)] ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label={dict.a11y.prevSlide}
              className="absolute start-3 top-1/2 z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center glass-btn rounded-full text-plum transition-[background-color,scale] duration-300 hover:scale-110 hover:bg-ivory"
            >
              <ChevronRight className="size-5 ltr:rotate-180" strokeWidth={2.25} />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label={dict.a11y.nextSlide}
              className="absolute end-3 top-1/2 z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center glass-btn rounded-full text-plum transition-[background-color,scale] duration-300 hover:scale-110 hover:bg-ivory"
            >
              <ChevronLeft className="size-5 ltr:rotate-180" strokeWidth={2.25} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <ul className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
          {images.map((src, i) => {
            const isActive = i === index;
            return (
              <li key={src + i}>
                <button
                  ref={(el) => {
                    thumbRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={fill(dict.a11y.showImage, { index: i + 1 })}
                  aria-current={isActive}
                  /* Inset rings: an outer ring would be clipped by the
                     horizontally scrolling list at the first thumbnail. */
                  className={`relative block size-20 shrink-0 cursor-pointer overflow-hidden rounded-[9px] bg-surface-2 transition-[box-shadow,opacity] duration-200 md:size-24 ${
                    isActive
                      ? "shadow-[inset_0_0_0_2px_var(--color-plum)]"
                      : "opacity-70 shadow-[inset_0_0_0_1px_var(--color-line)] hover:opacity-100 hover:shadow-[inset_0_0_0_2px_var(--color-line-strong)]"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
