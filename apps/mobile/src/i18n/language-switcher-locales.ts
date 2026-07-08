import type { AppUiLocale } from "./locales";

/** UI order: hy → en → ru (same as web `language-switcher-locales.ts`). */
export const LANGUAGE_SWITCHER_ORDER = ["hy", "en", "ru"] as const satisfies readonly [
  AppUiLocale,
  AppUiLocale,
  AppUiLocale,
];

export type LanguageSwitcherLocaleCode =
  (typeof LANGUAGE_SWITCHER_ORDER)[number];

/** Native language names — endonyms, same in every UI locale. */
export const LANGUAGE_SWITCHER_ENDONYMS: Readonly<
  Record<LanguageSwitcherLocaleCode, string>
> = {
  hy: "Հայերեն",
  en: "English",
  ru: "Русский",
};

export function languageSwitcherEndonym(
  code: LanguageSwitcherLocaleCode,
): string {
  return LANGUAGE_SWITCHER_ENDONYMS[code];
}

export function isLanguageSwitcherLocale(
  code: string,
): code is LanguageSwitcherLocaleCode {
  return (LANGUAGE_SWITCHER_ORDER as readonly string[]).includes(code);
}
