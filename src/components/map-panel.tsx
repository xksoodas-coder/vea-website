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
      className="absolute inset-0 overflow-hidden"
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
        <span className="glass-btn rounded-full px-3.5 py-1.5 text-xs text-plum">
          {dict.map.hint}
        </span>
      </div>

      {/* Always clickable, always on top of the iframe. */}
      <a
        href={site.map.href}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-btn absolute inset-x-4 bottom-6 z-10 inline-flex items-center justify-between gap-3 rounded-[10px] px-4 py-3 text-xs text-plum transition-[background-color,scale] duration-200 hover:scale-[1.01] hover:bg-ivory"
      >
        <MapPin className="size-4" />
        {dict.map.open}
        <ArrowUpLeft className="size-3.5 -scale-x-100 opacity-80 rtl:scale-x-100" />
      </a>
    </div>
  );
}
