/** Public UI locales — keep in sync with web `LANGUAGE_SWITCHER_ORDER` / next-intl routing. */
export const APP_UI_LOCALES = ["hy", "en", "ru"] as const;

export type AppUiLocale = (typeof APP_UI_LOCALES)[number];

export type EnabledLocalesMap = Record<AppUiLocale, boolean>;

/** Preferred fallback when the current locale is disabled (must exist in `APP_UI_LOCALES`). */
export const PREFERRED_FALLBACK_LOCALE: AppUiLocale = "en";

export function createDefaultEnabledLocales(): EnabledLocalesMap {
  return Object.fromEntries(APP_UI_LOCALES.map((locale) => [locale, true])) as EnabledLocalesMap;
}

export function isAppUiLocale(value: string): value is AppUiLocale {
  return (APP_UI_LOCALES as readonly string[]).includes(value);
}

/** Fills missing locale keys with defaults — used by API and web after partial reads. */
export function normalizeEnabledLocales(
  value: Partial<EnabledLocalesMap> | null | undefined,
): EnabledLocalesMap {
  const normalized = createDefaultEnabledLocales();
  if (value === null || value === undefined) {
    return normalized;
  }

  for (const locale of APP_UI_LOCALES) {
    const entry = value[locale];
    if (typeof entry === "boolean") {
      normalized[locale] = entry;
    }
  }

  if (!hasAtLeastOneEnabledLocale(normalized)) {
    return createDefaultEnabledLocales();
  }

  return normalized;
}

export function hasAtLeastOneEnabledLocale(locales: EnabledLocalesMap): boolean {
  return APP_UI_LOCALES.some((locale) => locales[locale]);
}

export function countEnabledLocales(locales: EnabledLocalesMap): number {
  return APP_UI_LOCALES.filter((locale) => locales[locale]).length;
}

export function listEnabledLocales(locales: EnabledLocalesMap): readonly AppUiLocale[] {
  return APP_UI_LOCALES.filter((locale) => locales[locale]);
}

/**
 * Resolves a safe locale when the requested one is disabled.
 * Prefers `PREFERRED_FALLBACK_LOCALE`, then the first enabled locale in display order.
 */
export function resolveFallbackLocale(locales: EnabledLocalesMap): AppUiLocale {
  const normalized = normalizeEnabledLocales(locales);
  if (normalized[PREFERRED_FALLBACK_LOCALE]) {
    return PREFERRED_FALLBACK_LOCALE;
  }

  const firstEnabled = listEnabledLocales(normalized)[0];
  return firstEnabled ?? PREFERRED_FALLBACK_LOCALE;
}

export function parseEnabledLocalesJson(
  json: string | null | undefined,
): EnabledLocalesMap {
  const defaults = createDefaultEnabledLocales();
  if (json === null || json === undefined || json.trim().length === 0) {
    return defaults;
  }

  try {
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return defaults;
    }

    return normalizeEnabledLocales(parsed as Partial<EnabledLocalesMap>);
  } catch {
    return defaults;
  }
}

export function serializeEnabledLocales(locales: EnabledLocalesMap): string {
  return JSON.stringify(normalizeEnabledLocales(locales));
}
