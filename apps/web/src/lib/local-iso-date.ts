import { startOfLocalDay } from "@/components/marketing/schedule/schedule-date-utils";

/** Calendar day as `YYYY-MM-DD` in the user's local timezone. */
export function toLocalIsoDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Local calendar day for an ISO timestamp or `Date`. */
export function localIsoDateFromValue(value: Date | string): string {
  return toLocalIsoDate(new Date(value));
}

export function scheduleTodayIsoDate(): string {
  return toLocalIsoDate(startOfLocalDay(new Date()));
}

export function scheduleSessionLocalIsoDay(startsAt: string): string {
  return toLocalIsoDate(new Date(startsAt));
}
