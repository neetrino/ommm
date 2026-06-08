export const CONTENT_POST_LOCALES = ['hy', 'ru', 'en'] as const;

export type ContentPostLocale = (typeof CONTENT_POST_LOCALES)[number];

export const CONTENT_POST_DEFAULT_LOCALE: ContentPostLocale = 'en';

export function isContentPostLocale(value: string): value is ContentPostLocale {
  return (CONTENT_POST_LOCALES as readonly string[]).includes(value);
}

export function resolveContentPostLocale(
  value: string | undefined,
): ContentPostLocale {
  if (value !== undefined && isContentPostLocale(value)) {
    return value;
  }
  return CONTENT_POST_DEFAULT_LOCALE;
}
