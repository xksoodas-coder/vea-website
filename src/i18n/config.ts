export const locales = ["fr", "ar", "en"] as const;

export type Locale = (typeof locales)[number];

/** The site is served in French unless another locale is requested. */
export const defaultLocale: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function dirOf(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Native names, shown in the language menu in their own language. */
export const localeNames: Record<Locale, string> = {
  fr: "Français",
  ar: "العربية",
  en: "English",
};

/** Short labels for the collapsed switcher button. */
export const localeShortNames: Record<Locale, string> = {
  fr: "FR",
  ar: "ع",
  en: "EN",
};

/** BCP-47 tags for <html lang> and og:locale. */
export const localeTags: Record<Locale, string> = {
  fr: "fr-DZ",
  ar: "ar-DZ",
  en: "en",
};
