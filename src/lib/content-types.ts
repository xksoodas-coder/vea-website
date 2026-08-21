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

/* -------------------------------------------------------------------------- */
/* Company profile — the "About us" page                                      */
/* -------------------------------------------------------------------------- */

/**
 * One free-form label/value row. Used for the optional extra facts an admin
 * can pin to a team member ("Diplôme" → "Pharmacien", "Ancienneté" → "12 ans")
 * without the schema having to know about them in advance.
 */
export type DetailField = {
  label: LocalizedText;
  value: LocalizedText;
};

/** A highlighted figure in the band under the About hero, e.g. 1998 / Fondée. */
export type CompanyStat = {
  /** Kept as text so "+250", "1998" and "3" all render the same way. */
  value: string;
  label: LocalizedText;
};

/** One card in the values grid. */
export type CompanyValue = {
  title: LocalizedText;
  description: LocalizedText;
};

/**
 * Singleton record behind /[lang]/about. Every field is optional in practice —
 * a section with no text simply does not render.
 */
export type CompanyProfile = {
  headline: LocalizedText;
  intro: LocalizedText;
  story: LocalizedText;
  mission: LocalizedText;
  vision: LocalizedText;
  stats: CompanyStat[];
  values: CompanyValue[];
};

export type StoredTeamMember = {
  id: string;
  name: LocalizedText;
  role: LocalizedText;
  bio: LocalizedText;
  photo: string | null;
  email: string;
  phone: string;
  linkedin: string;
  /** Optional extra rows, entirely admin-defined. */
  details: DetailField[];
  sortOrder: number;
  /** Hidden members stay in the dashboard but never reach the public page. */
  visible: boolean;
};

export type StoredGalleryItem = {
  id: string;
  image: string;
  title: LocalizedText;
  description: LocalizedText;
  sortOrder: number;
  visible: boolean;
};

export type Content = {
  banners: StoredBanner[];
  categories: StoredCategory[];
  products: StoredProduct[];
};

export const emptyLocalizedText = (): LocalizedText =>
  Object.fromEntries(locales.map((l) => [l, ""])) as LocalizedText;

export const emptyProfile = (): CompanyProfile => ({
  headline: emptyLocalizedText(),
  intro: emptyLocalizedText(),
  story: emptyLocalizedText(),
  mission: emptyLocalizedText(),
  vision: emptyLocalizedText(),
  stats: [],
  values: [],
});

/** True when at least one language carries text. */
export const hasText = (text: LocalizedText | null | undefined): boolean =>
  Boolean(text && locales.some((l) => text[l]?.trim()));

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
