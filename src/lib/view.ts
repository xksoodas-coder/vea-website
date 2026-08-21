import type { Locale } from "@/i18n/config";

import {
  formatSize,
  hasText,
  pick,
  type CompanyProfile,
  type Content,
  type StoredGalleryItem,
  type StoredProduct,
  type StoredTeamMember,
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


/* -------------------------------------------------------------------------- */
/* About page                                                                 */
/* -------------------------------------------------------------------------- */

export type ProfileView = {
  headline: string;
  intro: string;
  story: string;
  mission: string;
  vision: string;
  stats: { value: string; label: string }[];
  values: { title: string; description: string }[];
  /** False when nothing at all has been filled in yet. */
  hasAny: boolean;
};

export type TeamMemberView = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string | null;
  email: string;
  phone: string;
  linkedin: string;
  details: { label: string; value: string }[];
};

export type GalleryItemView = {
  id: string;
  image: string;
  title: string;
  description: string;
};

export function toProfileView(
  profile: CompanyProfile,
  locale: Locale,
): ProfileView {
  // A stat or value row is only worth rendering once it carries something.
  const stats = profile.stats
    .filter((stat) => stat.value.trim() || hasText(stat.label))
    .map((stat) => ({ value: stat.value.trim(), label: pick(stat.label, locale) }));

  const values = profile.values
    .filter((value) => hasText(value.title) || hasText(value.description))
    .map((value) => ({
      title: pick(value.title, locale),
      description: pick(value.description, locale),
    }));

  const view = {
    headline: pick(profile.headline, locale),
    intro: pick(profile.intro, locale),
    story: pick(profile.story, locale),
    mission: pick(profile.mission, locale),
    vision: pick(profile.vision, locale),
    stats,
    values,
  };

  return {
    ...view,
    hasAny: Boolean(
      view.headline ||
        view.intro ||
        view.story ||
        view.mission ||
        view.vision ||
        stats.length ||
        values.length,
    ),
  };
}

export function toTeamMemberViews(
  members: StoredTeamMember[],
  locale: Locale,
): TeamMemberView[] {
  return members.map((member) => ({
    id: member.id,
    name: pick(member.name, locale),
    role: pick(member.role, locale),
    bio: pick(member.bio, locale),
    photo: member.photo,
    email: member.email,
    phone: member.phone,
    linkedin: member.linkedin,
    details: member.details
      .filter((detail) => hasText(detail.label) || hasText(detail.value))
      .map((detail) => ({
        label: pick(detail.label, locale),
        value: pick(detail.value, locale),
      })),
  }));
}

export function toGalleryItemViews(
  items: StoredGalleryItem[],
  locale: Locale,
): GalleryItemView[] {
  return items.map((item) => ({
    id: item.id,
    image: item.image || PLACEHOLDER_IMAGE,
    title: pick(item.title, locale),
    description: pick(item.description, locale),
  }));
}
