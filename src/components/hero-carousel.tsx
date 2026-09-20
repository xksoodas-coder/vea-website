"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { ChevronLeft, ChevronRight } from "@/components/icons";
import { type Dictionary, fill } from "@/i18n";
import type { SlideView } from "@/lib/view";

const AUTOPLAY_MS = 6000;

/**
 * Arrows sit as ivory discs over the artwork — the same frosted paper the
 * page is made of, rather than glass. `scale` (not `transform`) is the
 * animated property: Tailwind v4 emits the standalone CSS property, so
 * listing `transform` here would not animate.
 */
const arrowClass =
  "glass-btn absolute top-1/2 z-10 flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-plum transition-[background-color,scale] duration-300 ease-out-soft hover:scale-110 hover:bg-ivory focus-visible:scale-110 active:scale-105 md:size-14";

export default function HeroCarousel({
  slides,
  dict,
}: {
  slides: SlideView[];
  dict: Dictionary;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = slides.length;
  const go = useCallback(
    (next: number) => setIndex(count ? ((next % count) + count) % count : 0),
    [count],
  );
  const prev = useCallback(() => go(index - 1), [go, index]);
  const next = useCallback(() => go(index + 1), [go, index]);

  /* Autoplay — stops on hover, focus, hidden tab and reduced motion. */
  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, count]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  /* Reading-direction keyboard mapping. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const rtl = document.documentElement.dir === "rtl";
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (rtl) next();
      else prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (rtl) prev();
      else next();
    }
  };

  return (
    <section
      id="top"
      aria-roledescription="carousel"
      aria-label={dict.a11y.carousel}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      /*
        Edge to edge, so the only rounding left is the outsized cut on the
        top start corner — the identity's signature shape. `rounded-ss`
        is logical, so it moves to the right in Arabic.
      */
      className="relative h-[330px] overflow-hidden rounded-none rounded-ss-[60px] bg-[#e9e4dc] sm:h-[425px] md:h-[470px] lg:h-[560px] lg:rounded-ss-[110px] xl:h-[620px]"
    >
      {slides.map((slide, i) => {
        const isActive = i === index;
        const Wrapper = slide.href ? "a" : "div";

        return (
          <div
            key={slide.id}
            role="group"
            aria-roledescription={dict.a11y.slide}
            aria-label={`${i + 1} / ${count}`}
            aria-hidden={!isActive}
            inert={!isActive}
            className={`absolute inset-0 transition-opacity duration-700 ease-out-soft ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          >
            <Wrapper
              {...(slide.href ? { href: slide.href } : {})}
              className="block size-full"
            >
              <Image
                src={slide.desktopImage}
                alt={slide.alt}
                fill
                priority={i === 0}
                loading={i === 0 ? undefined : "lazy"}
                sizes="100vw"
                className={`hidden object-cover transition-transform duration-[1200ms] ease-out md:block ${
                  isActive ? "scale-100" : "scale-[1.04]"
                }`}
              />
              <Image
                src={slide.mobileImage}
                alt=""
                aria-hidden="true"
                fill
                priority={i === 0}
                loading={i === 0 ? undefined : "lazy"}
                sizes="100vw"
                className={`object-cover transition-transform duration-[1200ms] ease-out md:hidden ${
                  isActive ? "scale-100" : "scale-[1.04]"
                }`}
              />
            </Wrapper>
          </div>
        );
      })}

      {count > 1 && (
        <>
          {/* Previous — start side */}
          <button
            type="button"
            onClick={prev}
            aria-label={dict.a11y.prevSlide}
            className={arrowClass + " start-4 md:start-8 lg:start-12"}
          >
            <ChevronRight className="size-6 ltr:rotate-180" />
          </button>

          {/* Next — end side */}
          <button
            type="button"
            onClick={next}
            aria-label={dict.a11y.nextSlide}
            className={arrowClass + " end-4 md:end-8 lg:end-12"}
          >
            <ChevronLeft className="size-6 ltr:rotate-180" />
          </button>

          {/* Dots — inside a frosted ivory pill, matching the arrows. */}
          <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center md:bottom-7">
            <div className="glass-btn flex items-center gap-0.5 rounded-full px-1.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`${dict.a11y.goToSlide} ${i + 1}`}
                  aria-current={i === index}
                  className="group flex h-9 w-6 cursor-pointer items-center justify-center"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      i === index
                        ? "w-6 bg-plum"
                        : "w-1.5 bg-plum/30 group-hover:bg-plum/60"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Announces slide changes without interrupting the user. */}
      {count > 0 && (
        <p className="sr-only" aria-live="polite">
          {`${fill(dict.a11y.slideStatus, { current: index + 1, total: count })} ${slides[index].alt}`}
        </p>
      )}
    </section>
  );
}
