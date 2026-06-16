/** Site-wide wall-clock display — always 24-hour (e.g. 22:00, not 10:00 PM). */
export const TIME_DISPLAY_24H_OPTIONS = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
} as const satisfies Intl.DateTimeFormatOptions;

export const HOUR_ONLY_24H_OPTIONS = {
  hour: "2-digit",
  hour12: false,
} as const satisfies Intl.DateTimeFormatOptions;

/** Formats a `Date` as `HH:mm` in 24-hour clock. */
export function formatTimeForUi(value: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, TIME_DISPLAY_24H_OPTIONS).format(value);
}

/** Formats an ISO datetime string as `HH:mm` in 24-hour clock. */
export function formatTimeForUiFromIso(iso: string, locale?: string): string {
  return formatTimeForUi(new Date(iso), locale);
}

/**
 * Formats API `HH:mm` schedule wall times for UI (already studio wall clock).
 */
export function formatScheduleTimeHHmm(_locale: string, value: string): string {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (match !== null) {
    return `${match[1]}:${match[2]}`;
  }
  return value;
}
