/**
 * Formats API `HH:mm` schedule times for marketing UI.
 */
export function formatScheduleTime(locale: string, value: string): string {
  void locale;
  const [hourPart, minutePart] = value.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return value;
  }
  const normalizedHour = ((Math.trunc(hour) % 24) + 24) % 24;
  const normalizedMinute = ((Math.trunc(minute) % 60) + 60) % 60;
  return `${normalizedHour}:${String(normalizedMinute).padStart(2, "0")}`;
}
