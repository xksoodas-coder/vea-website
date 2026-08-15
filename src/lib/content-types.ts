import { locales, type Locale } from "@/i18n/config";

/** One string per supported language. */
export type LocalizedText = Record<Locale, string>;

export type StoredBanner = {
  id: string;
  /** Landscape image for computers and tablets. */
  desktopImage: string;
  /** Portrait image for phones. Falls back to desktopImage when omitted. */
  mobileImage: string | null;
  alt: LocalizedText;
  /** In-page anchor or URL the banner links to. Empty means not clickable. */
  href: string;
  sortOrder: number;
};

export type StoredCategory = {
  id: string;
  label: LocalizedText;
  image: string | null;
};

export type StoredProduct = {
  id: string;
  /** URL segment, e.g. /fr/products/shampooing-nutritif */
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  /** Range shown on the card and the detail page, e.g. "Soin des cheveux". */
  line: LocalizedText;
  /** Volume in millilitres. null for products sold by count. */
  volumeMl: number | null;
  /** Free-form size label used when volumeMl does not apply, e.g. "20 lingettes". */
  sizeLabel: LocalizedText | null;
  categoryIds: string[];
  /** Ordered; the first entry is the main image. Empty shows the placeholder. */
  images: string[];
};

export type Content = {
  banners: StoredBanner[];
  categories: StoredCategory[];
  products: StoredProduct[];
};

export const emptyLocalizedText = (): LocalizedText =>
  Object.fromEntries(locales.map((l) => [l, ""])) as LocalizedText;

/**
 * Reads a localized value with a graceful fallback: the requested language,
 * then any other language that has content, then an empty string. Keeps a
 * half-translated product readable instead of blank.
 */
export function pick(text: LocalizedText | null | undefined, locale: Locale): string {
  if (!text) return "";
  if (text[locale]?.trim()) return text[locale];
  for (const l of locales) {
    if (text[l]?.trim()) return text[l];
  }
  return "";
}

/** Formats the size shown on cards and the detail page. */
export function formatSize(
  product: StoredProduct,
  locale: Locale,
  mlLabel: string,
): string {
  if (product.volumeMl != null) return `${product.volumeMl} ${mlLabel}`;
  return pick(product.sizeLabel, locale);
}
