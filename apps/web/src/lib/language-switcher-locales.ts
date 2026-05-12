import { routing } from "@/i18n/routing";

type AppLocale = (typeof routing.locales)[number];

/** UI order: hy → en → ru (each entry must exist in `routing.locales`). */
export const LANGUAGE_SWITCHER_ORDER = ["hy", "en", "ru"] as const satisfies readonly [
  AppLocale,
  AppLocale,
  AppLocale,
];

export type LanguageSwitcherLocaleCode =
  (typeof LANGUAGE_SWITCHER_ORDER)[number];

export function isLanguageSwitcherLocale(
  code: string,
): code is LanguageSwitcherLocaleCode {
  return (LANGUAGE_SWITCHER_ORDER as readonly string[]).includes(code);
}
