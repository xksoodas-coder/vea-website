import type { Locale } from "@/i18n/config";

import {
  formatSize,
  pick,
  type Content,
  type StoredProduct,
} from "./content-types";

/** The gray plate used wherever no image has been uploaded yet. */
export const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

export type SlideView = {
  id: string;
  desktopImage: string;
  mobileImage: string;
  alt: string;
  href: string;
};

export type CategoryView = {
  id: string;
  label: string;
  image: string | null;
};

export type ProductView = {
  id: string;
  slug: string;
  name: string;
  description: string;
  line: string;
  /** Ready-to-render size, e.g. "400 ml". Empty when unset. */
  size: string;
  categoryIds: string[];
  /** Always at least one entry — falls back to the placeholder. */
  images: string[];
};

/**
 * Flattens the stored catalogue into plain, already-translated objects.
 * Client components then never touch dictionaries or locale logic.
 */
export function toSlideViews(content: Content, locale: Locale): SlideView[] {
  return content.banners.map((b) => ({
    id: b.id,
    desktopImage: b.desktopImage || PLACEHOLDER_IMAGE,
    mobileImage: b.mobileImage || b.desktopImage || PLACEHOLDER_IMAGE,
    alt: pick(b.alt, locale),
    href: b.href,
  }));
}

export function toCategoryViews(content: Content, locale: Locale): CategoryView[] {
  return content.categories.map((c) => ({
    id: c.id,
    label: pick(c.label, locale),
    image: c.image,
  }));
}

export function toProductView(
  product: StoredProduct,
  locale: Locale,
  mlLabel: string,
): ProductView {
  return {
    id: product.id,
    slug: product.slug,
    name: pick(product.name, locale),
    description: pick(product.description, locale),
    line: pick(product.line, locale),
    size: formatSize(product, locale, mlLabel),
    categoryIds: product.categoryIds,
    images: product.images.length ? product.images : [PLACEHOLDER_IMAGE],
  };
}

export function toProductViews(
  content: Content,
  locale: Locale,
  mlLabel: string,
): ProductView[] {
  return content.products.map((p) => toProductView(p, locale, mlLabel));
}
