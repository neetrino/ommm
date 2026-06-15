import { PUBLIC_SCHEDULE_RANGE_DAYS } from "@/lib/public-schedule-constants";
import {
  addStudioCalendarDays,
  endOfStudioDayInclusive,
  startOfStudioDay,
  studioWallClockToUtc,
  utcToStudioCalendarDate,
} from "@/lib/studio-timezone";

export type ScheduleSessionRange = {
  from: Date;
  to: Date;
};

/** Rolling public schedule bounds in studio timezone (today through today + N days). */
export function resolvePublicScheduleBounds(
  rangeDays: number = PUBLIC_SCHEDULE_RANGE_DAYS,
  referenceDate: Date = new Date(),
): { today: Date; maxDate: Date } {
  const todayCalendar = utcToStudioCalendarDate(referenceDate);
  const today = startOfStudioDay(referenceDate);
  const maxCalendar = addStudioCalendarDays(todayCalendar, rangeDays);
  const maxDate = studioWallClockToUtc(maxCalendar, "12:00");
  return { today, maxDate };
}

/** Inclusive studio-day window for the public schedule (today through today + N days). */
export function resolvePublicScheduleRange(
  rangeDays: number = PUBLIC_SCHEDULE_RANGE_DAYS,
  referenceDate: Date = new Date(),
): ScheduleSessionRange {
  const { today, maxDate } = resolvePublicScheduleBounds(rangeDays, referenceDate);
  return {
    from: today,
    to: endOfStudioDayInclusive(maxDate),
  };
}

/** Keeps only sessions whose studio calendar day falls inside the rolling public window. */
export function isWithinPublicScheduleWindow(
  sessionDateIso: string,
  rangeDays: number = PUBLIC_SCHEDULE_RANGE_DAYS,
  referenceDate: Date = new Date(),
): boolean {
  const todayCalendar = utcToStudioCalendarDate(referenceDate);
  const maxCalendar = addStudioCalendarDays(todayCalendar, rangeDays);
  const sessionCalendar = sessionDateIso.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sessionCalendar)) {
    const parsed = new Date(sessionDateIso);
    if (Number.isNaN(parsed.getTime())) {
      return false;
    }
    const normalized = utcToStudioCalendarDate(parsed);
    return normalized >= todayCalendar && normalized <= maxCalendar;
  }
  return sessionCalendar >= todayCalendar && sessionCalendar <= maxCalendar;
}

/** Query string for `GET /schedule/public` with an explicit 30-day window. */
export function buildPublicScheduleRangeQuery(
  rangeDays: number = PUBLIC_SCHEDULE_RANGE_DAYS,
): string {
  const { from, to } = resolvePublicScheduleRange(rangeDays);
  return `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;
}

/** Query string for member class browsing — from start of studio today, no upper bound. */
export function buildMemberSessionsRangeQuery(): string {
  const from = startOfStudioDay();
  return `from=${encodeURIComponent(from.toISOString())}`;
}
