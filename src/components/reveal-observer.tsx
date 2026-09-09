"use client";

import { useEffect } from "react";

/** Anything already faded in stays that way — never re-observed. */
const SELECTOR = '.reveal:not([data-visible="true"])';

/**
 * Mounted once in the locale layout. Fades in every `.reveal` element as it
 * scrolls into view, so the sections themselves stay server components — no
 * per-section client bundle just to animate.
 *
 * The layout commits before the streamed page does, and it is not remounted by
 * a client navigation, so a one-off sweep of the document would miss almost
 * everything. A MutationObserver picks up `.reveal` nodes whenever they land.
 */
export default function RevealObserver() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = reduced
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              entry.target.setAttribute("data-visible", "true");
              io?.unobserve(entry.target);
            }
          },
          { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
        );

    const track = (node: HTMLElement) => {
      if (reduced) {
        node.setAttribute("data-visible", "true");
        return;
      }
      io?.observe(node);
    };

    const trackWithin = (root: ParentNode) => {
      if (root instanceof HTMLElement && root.matches(SELECTOR)) track(root);
      root.querySelectorAll<HTMLElement>(SELECTOR).forEach(track);
    };

    trackWithin(document);

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof HTMLElement) trackWithin(node);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io?.disconnect();
    };
  }, []);

  return null;
}
