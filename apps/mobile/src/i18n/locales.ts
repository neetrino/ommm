/** Must match `apps/web/src/i18n/routing.ts` and API `APP_UI_LOCALES`. */
export const APP_UI_LOCALES = ["en", "hy", "ru"] as const;

export type AppUiLocale = (typeof APP_UI_LOCALES)[number];

/** Same default as web routing (`localeDetection: false`, bare `/` → `/en`). */
export const DEFAULT_UI_LOCALE: AppUiLocale = "en";

/** Same storage key name as web cookie `OMMM_LOCALE`. */
export const UI_LOCALE_STORAGE_KEY = "OMMM_LOCALE";

export function isAppUiLocale(value: string): value is AppUiLocale {
  return (APP_UI_LOCALES as readonly string[]).includes(value);
}

export function normalizeAppUiLocale(
  value: string | undefined,
  fallback: AppUiLocale = DEFAULT_UI_LOCALE,
): AppUiLocale {
  if (value !== undefined && isAppUiLocale(value)) {
    return value;
  }
  return fallback;
}

/** BCP 47 tag for `Intl` formatters (matches web `request.ts` mapping). */
export function intlLocaleTag(locale: AppUiLocale): string {
  if (locale === "hy") {
    return "hy-AM";
  }
  if (locale === "ru") {
    return "ru-RU";
  }
  return "en-US";
}
