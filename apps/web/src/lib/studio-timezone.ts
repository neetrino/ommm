import type { MarketingScheduleDayOfWeek } from "@/components/marketing/schedule/marketing-schedule-types";

/** Studio wall-clock timezone (matches admin schedule and payment emails). */
export const STUDIO_TIMEZONE = "Asia/Yerevan";

/** `Date.getTimezoneOffset()` convention for {@link STUDIO_TIMEZONE} (UTC+4 → -240). */
export const STUDIO_TIMEZONE_OFFSET_MINUTES = -240;

const STUDIO_WALL_CLOCK_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: STUDIO_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const STUDIO_CALENDAR_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: STUDIO_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const STUDIO_WEEKDAY = new Intl.DateTimeFormat("en-US", {
  timeZone: STUDIO_TIMEZONE,
  weekday: "short",
});

const STUDIO_WEEKDAY_TO_ENUM: Record<string, MarketingScheduleDayOfWeek> = {
  Sun: "SUNDAY",
  Mon: "MONDAY",
  Tue: "TUESDAY",
  Wed: "WEDNESDAY",
  Thu: "THURSDAY",
  Fri: "FRIDAY",
  Sat: "SATURDAY",
};

const STUDIO_WEEKDAY_OFFSET: Record<MarketingScheduleDayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

/** `YYYY-MM-DD` calendar day for an instant in the studio timezone. */
export function utcToStudioCalendarDate(value: Date): string {
  return STUDIO_CALENDAR_DATE.format(value);
}

/** `HH:mm` wall clock for an instant in the studio timezone. */
export function utcToStudioWallClockTime(value: Date): string {
  return STUDIO_WALL_CLOCK_TIME.format(value);
}

/** Day-of-week for an instant in the studio timezone. */
export function utcToStudioDayOfWeek(value: Date): MarketingScheduleDayOfWeek {
  const label = STUDIO_WEEKDAY.format(value);
  return STUDIO_WEEKDAY_TO_ENUM[label] ?? "MONDAY";
}

/** Converts studio calendar day + wall time to a UTC instant. */
export function studioWallClockToUtc(dateIso: string, timeHm: string): Date {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso.trim());
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeHm.trim());
  if (dateMatch === null || timeMatch === null) {
    throw new Error("Invalid studio wall-clock date/time");
  }

  const utcMs =
    Date.UTC(
      Number(dateMatch[1]),
      Number(dateMatch[2]) - 1,
      Number(dateMatch[3]),
      Number(timeMatch[1]),
      Number(timeMatch[2]),
    ) +
    STUDIO_TIMEZONE_OFFSET_MINUTES * 60_000;

  return new Date(utcMs);
}

/** Parses `sessionDate` from the public schedule API (`YYYY-MM-DD` or ISO instant). */
export function resolveStudioCalendarDateFromSessionDate(
  sessionDate: string,
): string | null {
  const trimmed = sessionDate.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return utcToStudioCalendarDate(parsed);
}

/** Start of the studio calendar day for `reference` (defaults to now). */
export function startOfStudioDay(reference: Date = new Date()): Date {
  const calendarDate = utcToStudioCalendarDate(reference);
  return studioWallClockToUtc(calendarDate, "00:00");
}

/** End of the studio calendar day for `reference`, inclusive through 23:59:59.999. */
export function endOfStudioDayInclusive(reference: Date = new Date()): Date {
  const calendarDate = utcToStudioCalendarDate(reference);
  const end = studioWallClockToUtc(calendarDate, "23:59");
  end.setUTCSeconds(59, 999);
  return end;
}

export function addStudioCalendarDays(
  calendarDateIso: string,
  deltaDays: number,
): string {
  const start = studioWallClockToUtc(calendarDateIso, "12:00");
  start.setUTCDate(start.getUTCDate() + deltaDays);
  return utcToStudioCalendarDate(start);
}

/** Sunday start of the studio week that contains `reference`. */
export function startOfStudioWeekSunday(reference: Date = new Date()): Date {
  const calendarDate = utcToStudioCalendarDate(reference);
  const offset = STUDIO_WEEKDAY_OFFSET[utcToStudioDayOfWeek(reference)];
  const weekStartCalendar = addStudioCalendarDays(calendarDate, -offset);
  return studioWallClockToUtc(weekStartCalendar, "00:00");
}

/** `YYYY-MM-DD` for Sunday of the studio week that contains `reference`. */
export function studioWeekStartCalendarDate(reference: Date = new Date()): string {
  const calendarDate = utcToStudioCalendarDate(reference);
  const offset = STUDIO_WEEKDAY_OFFSET[utcToStudioDayOfWeek(reference)];
  return addStudioCalendarDays(calendarDate, -offset);
}
