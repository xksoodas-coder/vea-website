/**
 * Language-neutral company facts. Anything with words in it (company name in
 * Arabic, address, opening hours, descriptions) lives in
 * `src/i18n/dictionaries/*` instead.
 *
 * ⚠️  PLACEHOLDER — every value marked `TODO` below is filler. Replace them
 *     with the real company details.
 */

import type { Locale } from "@/i18n/config";

export const site = {
  /** Latin brand name, used in titles and alt text. */
  brand: "Véa",

  /**
   * Logo slot. `logo.svg` is drawn on white, `logo-light.svg` on the navy
   * footer. Swap both files to change the mark everywhere — nothing else
   * needs editing as long as the aspect ratio below stays in step.
   */
  logo: {
    src: "/images/brand/logo.svg",
    srcLight: "/images/brand/logo-light.svg",
    width: 232,
    height: 152,
    alt: "véa intime",
  },

  contact: {
    // TODO: real numbers
    phones: ["+213 21 00 00 00", "+213 5 00 00 00 00"],
    // TODO: real addresses
    emails: ["contact@vea-dz.com", "commercial@vea-dz.com"],
  },

  social: [
    { label: "Facebook", href: "#", icon: "facebook" as const },
    { label: "Instagram", href: "#", icon: "instagram" as const },
    { label: "YouTube", href: "#", icon: "youtube" as const },
  ],

  /** Google Maps — Sarl Hyprodis Laboratoires. */
  map: {
    lat: 36.6506843,
    lng: 3.0054987,
    zoom: 16,
    /** Opened in a new tab when the user clicks the map. */
    href: "https://www.google.com/maps/place/Sarl+Hyprodis+Laboratoires/@36.6506843,3.0054987,1252m/data=!3m2!1e3!4b1!4m6!3m5!1s0x128fa9affe761ba1:0x2efc503cafe2ada!8m2!3d36.6506843!4d3.0054987!16s%2Fg%2F11zh6r3jjz!18m1!1e1",
  },
} as const;

/** Embed URL for the footer map iframe — no API key required. */
export function mapEmbedSrc(locale: Locale): string {
  const { lat, lng, zoom } = site.map;
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&hl=${locale}&output=embed`;
}
