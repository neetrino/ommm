import type {
  MarketingScheduleDayOfWeek,
  MarketingScheduleItem,
} from "@/components/marketing/schedule/marketing-schedule-types";
import {
  addStudioCalendarDays,
  resolveStudioCalendarDateFromSessionDate,
  utcToStudioCalendarDate,
  utcToStudioDayOfWeek,
} from "@/lib/studio-timezone";

const STUDIO_DAY_TO_WEEK_OFFSET: Record<MarketingScheduleDayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

/** Studio calendar date (`YYYY-MM-DD`) for a weekday tab in the Sun–Sat week containing `reference`. */
export function getHomeWeeklyScheduleTabCalendarDate(
  day: MarketingScheduleDayOfWeek,
  reference: Date = new Date(),
): string {
  const todayIso = utcToStudioCalendarDate(reference);
  const todayDay = utcToStudioDayOfWeek(reference);
  const delta =
    STUDIO_DAY_TO_WEEK_OFFSET[day] - STUDIO_DAY_TO_WEEK_OFFSET[todayDay];
  return addStudioCalendarDays(todayIso, delta);
}

/** Studio calendar date for a schedule row (exact API date or current-week weekday fallback). */
export function resolveHomeWeeklyScheduleItemCalendarDate(
  item: MarketingScheduleItem,
  reference: Date = new Date(),
): string | null {
  if (item.sessionDate !== null) {
    return resolveStudioCalendarDateFromSessionDate(item.sessionDate);
  }
  return getHomeWeeklyScheduleTabCalendarDate(item.dayOfWeek, reference);
}
