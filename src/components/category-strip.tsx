"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Dictionary } from "@/i18n";
import type { CategoryView } from "@/lib/view";

type Props = {
  categories: CategoryView[];
  dict: Dictionary;
  active: string;
  onSelect: (id: string) => void;
};

/**
 * Round category picker with a draggable scrollbar underneath.
 *
 * RTL note: Chrome reports `scrollLeft` as 0 at the start and negative toward
 * the end, so progress is derived from its magnitude and the thumb is
 * positioned with a logical inset.
 */
export default function CategoryStrip({ categories, dict, active, onSelect }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const drag = useRef<{ x: number; scroll: number } | null>(null);

  const [thumb, setThumb] = useState({ width: 100, offset: 0 });
  const [overflowing, setOverflowing] = useState(false);

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;
    if (max <= 1) {
      setOverflowing(false);
      setThumb({ width: 100, offset: 0 });
      return;
    }

    const width = (el.clientWidth / el.scrollWidth) * 100;
    const progress = Math.min(1, Math.abs(el.scrollLeft) / max);
    setOverflowing(true);
    setThumb({ width, offset: progress * (100 - width) });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    const content = contentRef.current;
    if (!el || !content) return;

    measure();
    el.addEventListener("scroll", measure, { passive: true });

    /*
      Observe the content as well as the viewport: resizing the window changes
      the scroller's box and reflows the row in the same layout pass, and
      observing only the scroller can sample scrollWidth before the row has
      settled — which reads as "no overflow" and pins the thumb at 100%.
    */
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(content);

    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  /* Keep the selected category in view when the strip overflows. */
  useEffect(() => {
    const el = scrollerRef.current;
    const tab = tabRefs.current[categories.findIndex((c) => c.id === active)];
    if (!el || !tab || el.scrollWidth <= el.clientWidth) return;

    const elBox = el.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    const delta = tabBox.left + tabBox.width / 2 - (elBox.left + elBox.width / 2);
    if (Math.abs(delta) < 2) return;

    el.scrollBy({
      left: delta,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [active, categories]);

  /* --- scrollbar dragging ------------------------------------------- */

  const onThumbPointerDown = (e: React.PointerEvent) => {
    const el = scrollerRef.current;
    if (!el) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, scroll: el.scrollLeft };
  };

  const onThumbPointerMove = (e: React.PointerEvent) => {
    const el = scrollerRef.current;
    const track = trackRef.current;
    if (!drag.current || !el || !track) return;

    const max = el.scrollWidth - el.clientWidth;
    const thumbWidth = track.clientWidth * (el.clientWidth / el.scrollWidth);
    const travel = track.clientWidth - thumbWidth;
    if (travel <= 0) return;

    el.scrollLeft = drag.current.scroll + ((e.clientX - drag.current.x) / travel) * max;
  };

  const endDrag = (e: React.PointerEvent) => {
    drag.current = null;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  /* --- keyboard ------------------------------------------------------ */

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const last = categories.length - 1;
    const rtl = document.documentElement.dir === "rtl";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    let target: number | null = null;

    if (e.key === forward) target = i === last ? 0 : i + 1;
    else if (e.key === back) target = i === 0 ? last : i - 1;
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = last;

    if (target === null) return;
    e.preventDefault();
    onSelect(categories[target].id);
    tabRefs.current[target]?.focus();
  };

  return (
    /* A quiet band between the banner and the collection, ruled top and
       bottom like the reference's ribbon. */
    <div className="border-y border-line py-8 md:py-10">
      <h2 className="container-page mb-7 text-center text-[clamp(1.6rem,3vw,2.4rem)] md:mb-9">
        {dict.categoriesHeading}
      </h2>

      <div
        ref={scrollerRef}
        role="tablist"
        aria-label={dict.a11y.categories}
        className="no-scrollbar overflow-x-auto overscroll-x-contain"
      >
        <div
          ref={contentRef}
          className="container-page flex w-max min-w-full justify-start gap-6 sm:gap-10 md:justify-center md:gap-14"
        >
          {categories.map((category, i) => {
            const isActive = category.id === active;
            return (
              <button
                key={category.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${category.id}`}
                aria-selected={isActive}
                aria-controls="product-panel"
                tabIndex={isActive ? 0 : -1}
                onClick={() => onSelect(category.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className="group flex shrink-0 cursor-pointer flex-col items-center gap-2.5 pb-1"
              >
                <span
                  className={`relative flex size-16 items-center justify-center overflow-hidden rounded-full transition-[box-shadow,background-color] duration-300 md:size-20 ${
                    isActive
                      ? "bg-blush shadow-[0_0_0_2px_var(--color-plum)]"
                      : "bg-brand-50 shadow-[0_0_0_1px_var(--color-line)] group-hover:bg-blush/60 group-hover:shadow-[0_0_0_1px_var(--color-line-strong)]"
                  }`}
                >
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    /* Empty slot — upload a category image from the dashboard. */
                    <span
                      aria-hidden="true"
                      className="size-[72%] rounded-full border border-dashed border-line-strong"
                    />
                  )}
                </span>

                <span
                  className={`text-[0.8125rem] whitespace-nowrap transition-colors duration-300 md:text-sm ${
                    isActive ? "font-medium text-plum" : "text-ink-soft group-hover:text-plum"
                  }`}
                >
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scroll track — always visible; draggable once the strip overflows. */}
      <div className="container-page mt-7">
        <div
          ref={trackRef}
          className="relative mx-auto h-px max-w-3xl rounded-full bg-line"
          aria-hidden="true"
        >
          <div
            onPointerDown={overflowing ? onThumbPointerDown : undefined}
            onPointerMove={overflowing ? onThumbPointerMove : undefined}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            style={{ width: `${thumb.width}%`, insetInlineStart: `${thumb.offset}%` }}
            className={`absolute top-1/2 h-[3px] -translate-y-1/2 touch-none rounded-full bg-plum transition-colors duration-200 ${
              overflowing ? "cursor-grab hover:bg-rose-ink active:cursor-grabbing" : ""
            }`}
          >
            {/* Widens the grab area to a comfortable height without moving the bar. */}
            {overflowing && <span className="absolute inset-x-0 -top-3.5 h-8" />}
          </div>
        </div>
      </div>
    </div>
  );
}
