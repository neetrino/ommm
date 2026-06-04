/**
 * Formats API `HH:mm` schedule times for marketing UI (locale-aware 12/24h).
 */
export function formatScheduleTime(locale: string, value: string): string {
  const [hourPart, minutePart] = value.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return value;
  }

  const normalizedHour = ((Math.trunc(hour) % 24) + 24) % 24;
  const normalizedMinute = ((Math.trunc(minute) % 60) + 60) % 60;
  /** UTC wall time — same string on Node SSR and mobile Safari (local TZ must not affect output). */
  const date = new Date(Date.UTC(1970, 0, 1, normalizedHour, normalizedMinute));

  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}
