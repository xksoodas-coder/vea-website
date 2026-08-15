"use client";

import { useEffect, useRef, useState } from "react";

import { ArrowUpLeft, MapPin } from "@/components/icons";
import { mapEmbedSrc, site } from "@/data/site";
import { type Dictionary, fill } from "@/i18n";
import type { Locale } from "@/i18n/config";

/**
 * Live Google Maps panel.
 *
 * The iframe stays pointer-inert until the cursor has rested on it for a
 * moment — that way scrolling past the footer never gets hijacked into
 * zooming the map, but hovering to pan/zoom works exactly as expected.
 */
const DWELL_MS = 320;

export default function MapPanel({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const [live, setLive] = useState(false);
  const timer = useRef<number | null>(null);

  const clear = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => clear, []);

  return (
    <div
      onMouseEnter={() => {
        clear();
        timer.current = window.setTimeout(() => setLive(true), DWELL_MS);
      }}
      onMouseLeave={() => {
        clear();
        setLive(false);
      }}
      className={`relative h-80 overflow-hidden rounded-card border transition-[border-color,box-shadow] duration-300 lg:h-full lg:min-h-[24rem] ${
        live
          ? "border-brand-300/70 shadow-[0_0_0_3px_rgba(128,152,226,0.20)]"
          : "border-white/12"
      }`}
    >
      <iframe
        src={mapEmbedSrc(locale)}
        title={fill(dict.map.title, { company: dict.footer.companyName })}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 size-full border-0"
        style={{ pointerEvents: live ? "auto" : "none" }}
      />

      {/* Hint — fades out once the map takes over. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-3 top-3 flex justify-center transition-opacity duration-300 ${
          live ? "opacity-0" : "opacity-100"
        }`}
      >
        <span className="glass-btn rounded-full px-3.5 py-1.5 text-xs font-medium text-white">
          {dict.map.hint}
        </span>
      </div>

      {/* Always clickable, always on top of the iframe. */}
      <a
        href={site.map.href}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-btn absolute end-3 bottom-3 z-10 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold text-white transition-[background-color,scale] duration-200 hover:scale-[1.03] hover:bg-brand-950/55"
      >
        <MapPin className="size-4" />
        {dict.map.open}
        <ArrowUpLeft className="size-3.5 opacity-80" />
      </a>
    </div>
  );
}
