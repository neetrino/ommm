import { PUBLIC_SCHEDULE_RANGE_DAYS } from "@/lib/public-schedule-constants";
import {
  addDays,
  isAfterCalendarDay,
  isBeforeCalendarDay,
  startOfLocalDay,
} from "@/components/marketing/schedule/schedule-date-utils";

function endOfLocalDay(input: Date): Date {
  const d = new Date(input);
  d.setHours(23, 59, 59, 999);
  return d;
}

export type ScheduleSessionRange = {
  from: Date;
  to: Date;
};

/** Rolling public schedule bounds: today (inclusive) through today + N days (inclusive). */
export function resolvePublicScheduleBounds(
  rangeDays: number = PUBLIC_SCHEDULE_RANGE_DAYS,
  referenceDate: Date = new Date(),
): { today: Date; maxDate: Date } {
  const today = startOfLocalDay(referenceDate);
  const maxDate = addDays(today, rangeDays);
  return { today, maxDate };
}

/** Inclusive local-day window for the public schedule (today through today + N days). */
export function resolvePublicScheduleRange(
  rangeDays: number = PUBLIC_SCHEDULE_RANGE_DAYS,
  referenceDate: Date = new Date(),
): ScheduleSessionRange {
  const { today, maxDate } = resolvePublicScheduleBounds(rangeDays, referenceDate);
  return { from: today, to: endOfLocalDay(maxDate) };
}

/** Keeps only sessions whose calendar day falls inside the rolling public window. */
export function isWithinPublicScheduleWindow(
  sessionDateIso: string,
  rangeDays: number = PUBLIC_SCHEDULE_RANGE_DAYS,
  referenceDate: Date = new Date(),
): boolean {
  const { today, maxDate } = resolvePublicScheduleBounds(rangeDays, referenceDate);
  const sessionDay = startOfLocalDay(new Date(sessionDateIso));
  if (isBeforeCalendarDay(sessionDay, today)) {
    return false;
  }
  if (isAfterCalendarDay(sessionDay, maxDate)) {
    return false;
  }
  return true;
}

/** Query string for `GET /schedule/public` with an explicit 30-day window. */
export function buildPublicScheduleRangeQuery(
  rangeDays: number = PUBLIC_SCHEDULE_RANGE_DAYS,
): string {
  const { from, to } = resolvePublicScheduleRange(rangeDays);
  return `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;
}

/** Query string for member class browsing — from start of today, no upper bound. */
export function buildMemberSessionsRangeQuery(): string {
  const from = startOfLocalDay(new Date());
  return `from=${encodeURIComponent(from.toISOString())}`;
}
