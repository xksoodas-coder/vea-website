import type { Locale } from "./config";
import ar from "./dictionaries/ar";
import en from "./dictionaries/en";
import fr, { type Dictionary } from "./dictionaries/fr";

const dictionaries: Record<Locale, Dictionary> = { fr, ar, en };

/**
 * Loaded in Server Components only, then passed down as plain props — that
 * way a single locale's strings reach the client, not all three.
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary } from "./dictionaries/fr";

/** Fills `{name}` placeholders in a dictionary string. */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
