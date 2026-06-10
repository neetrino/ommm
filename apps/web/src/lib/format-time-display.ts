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
 * Formats API `HH:mm` schedule wall times for UI.
 * Uses UTC so SSR and client render the same string.
 */
export function formatScheduleTimeHHmm(locale: string, value: string): string {
  const [hourPart, minutePart] = value.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return value;
  }

  const normalizedHour = ((Math.trunc(hour) % 24) + 24) % 24;
  const normalizedMinute = ((Math.trunc(minute) % 60) + 60) % 60;
  const date = new Date(Date.UTC(1970, 0, 1, normalizedHour, normalizedMinute));

  return new Intl.DateTimeFormat(locale, {
    ...TIME_DISPLAY_24H_OPTIONS,
    timeZone: "UTC",
  }).format(date);
}
