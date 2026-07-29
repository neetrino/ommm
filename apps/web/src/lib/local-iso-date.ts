import { utcToStudioCalendarDate } from "@/lib/studio-timezone";

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

/** Studio calendar day for “today” on schedule surfaces (Asia/Yerevan). */
export function scheduleTodayIsoDate(): string {
  return utcToStudioCalendarDate(new Date());
}

/** Studio calendar day for a session `startsAt` instant. */
export function scheduleSessionLocalIsoDay(startsAt: string): string {
  return utcToStudioCalendarDate(new Date(startsAt));
}
