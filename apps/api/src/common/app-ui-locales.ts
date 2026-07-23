export const APP_UI_LOCALES = ['hy', 'en', 'ru'] as const;

export type AppUiLocale = (typeof APP_UI_LOCALES)[number];

export function isAppUiLocale(value: string): value is AppUiLocale {
  return (APP_UI_LOCALES as readonly string[]).includes(value);
}

export function normalizeAppUiLocale(
  value: string | undefined,
  fallback: AppUiLocale,
): AppUiLocale {
  if (value !== undefined && isAppUiLocale(value)) {
    return value;
  }
  return fallback;
}
