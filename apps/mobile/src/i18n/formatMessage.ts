import { intlLocaleTag, type AppUiLocale } from "./locales";

export type TranslationValues = Record<
  string,
  string | number | boolean | Date | null | undefined
>;

function readNumericValue(values: TranslationValues, key: string): number {
  const raw = values[key];
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === "string" && raw.trim() !== "" && !Number.isNaN(Number(raw))) {
    return Number(raw);
  }
  return 0;
}

function pickPluralForm(
  count: number,
  one?: string,
  other?: string,
  zero?: string,
): string {
  if (count === 0 && zero !== undefined) {
    return zero;
  }
  if (count === 1 && one !== undefined) {
    return one;
  }
  return other ?? one ?? "";
}

function formatPluralSegment(
  template: string,
  values: TranslationValues,
): string {
  const pluralPattern =
    /\{(\w+),\s*plural,\s*((?:=\d+\s*\{[^{}]*\}\s*|one\s*\{[^{}]*\}\s*|other\s*\{[^{}]*\}\s*)+)\}/g;

  return template.replace(pluralPattern, (_match, key: string, rulesBlock: string) => {
    const count = readNumericValue(values, key);
    let zero: string | undefined;
    let one: string | undefined;
    let other: string | undefined;

    const rulePattern = /(=\d+|one|other)\s*\{([^{}]*)\}/g;
    let ruleMatch: RegExpExecArray | null;
    while ((ruleMatch = rulePattern.exec(rulesBlock)) !== null) {
      const [, ruleName, ruleText] = ruleMatch;
      if (ruleName === "one") {
        one = ruleText;
      } else if (ruleName === "other") {
        other = ruleText;
      } else if (ruleName.startsWith("=")) {
        const exact = Number(ruleName.slice(1));
        if (count === exact) {
          return ruleText.replace(/#/g, String(count));
        }
        if (exact === 0) {
          zero = ruleText;
        }
      }
    }

    const selected = pickPluralForm(count, one, other, zero).replace(/#/g, String(count));
    return selected;
  });
}

function interpolateSimple(
  template: string,
  values?: TranslationValues,
): string {
  if (!values) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    if (value === undefined || value === null) {
      return match;
    }
    return String(value);
  });
}

export function formatMessage(
  locale: AppUiLocale,
  template: string,
  values?: TranslationValues,
): string {
  void intlLocaleTag(locale);
  const withPlurals = formatPluralSegment(template, values ?? {});
  return interpolateSimple(withPlurals, values);
}

export function formatValidityDays(
  locale: AppUiLocale,
  count: number,
  t: (key: string, values?: TranslationValues) => string,
): string {
  if (count === 1) {
    return t("packagesPeriodDaysShort", { days: count });
  }
  return t("packagesValidityDays", { count });
}

export function formatMembershipValidityRemaining(
  locale: AppUiLocale,
  count: number,
  t: (key: string, values?: TranslationValues) => string,
): string {
  if (count <= 0) {
    return t("validityExpired");
  }
  return t("validityDaysRemaining", { count });
}
