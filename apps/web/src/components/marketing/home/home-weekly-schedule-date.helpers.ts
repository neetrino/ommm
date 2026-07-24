import type {
  MarketingScheduleDayOfWeek,
  MarketingScheduleItem,
} from "@/components/marketing/schedule/marketing-schedule-types";
import {
  addStudioCalendarDays,
  resolveStudioCalendarDateFromSessionDate,
  studioWallClockToUtc,
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

/** Monday=0 … Sunday=6 for Mon–Sun weekly schedule tabs. */
function daysSinceMonday(day: MarketingScheduleDayOfWeek): number {
  return day === "SUNDAY" ? 6 : STUDIO_DAY_TO_WEEK_OFFSET[day] - 1;
}

/** Studio calendar day-of-week for a `YYYY-MM-DD` date. */
export function studioCalendarDateToDayOfWeek(
  calendarDateIso: string,
): MarketingScheduleDayOfWeek {
  return utcToStudioDayOfWeek(studioWallClockToUtc(calendarDateIso, "12:00"));
}

/**
 * Nearest upcoming session calendar day at/after studio today.
 * Falls back to today when there are no upcoming dated sessions.
 */
export function resolveHomeWeeklyScheduleFocusDate(
  items: readonly Pick<MarketingScheduleItem, "sessionDate" | "isActive">[],
  reference: Date = new Date(),
): string {
  const todayIso = utcToStudioCalendarDate(reference);
  let nearest: string | null = null;

  for (const item of items) {
    if (!item.isActive || item.sessionDate === null) {
      continue;
    }
    const sessionDay = resolveStudioCalendarDateFromSessionDate(item.sessionDate);
    if (sessionDay === null || sessionDay < todayIso) {
      continue;
    }
    if (nearest === null || sessionDay < nearest) {
      nearest = sessionDay;
    }
  }

  return nearest ?? todayIso;
}

/** Monday (`YYYY-MM-DD`) of the Mon–Sun week that contains `calendarDateIso`. */
export function getHomeWeeklyScheduleWeekMonday(
  calendarDateIso: string,
): string {
  const day = studioCalendarDateToDayOfWeek(calendarDateIso);
  return addStudioCalendarDays(calendarDateIso, -daysSinceMonday(day));
}

/**
 * Studio calendar date for a weekday tab in the Mon–Sun week containing `focusDateIso`.
 * When omitted, `focusDateIso` defaults to studio today (current week).
 */
export function getHomeWeeklyScheduleTabCalendarDate(
  day: MarketingScheduleDayOfWeek,
  reference: Date = new Date(),
  focusDateIso: string = utcToStudioCalendarDate(reference),
): string {
  const weekMonday = getHomeWeeklyScheduleWeekMonday(focusDateIso);
  return addStudioCalendarDays(weekMonday, daysSinceMonday(day));
}

/** Studio calendar date for a schedule row (exact API date or tab weekday fallback). */
export function resolveHomeWeeklyScheduleItemCalendarDate(
  item: MarketingScheduleItem,
  reference: Date = new Date(),
  focusDateIso: string = utcToStudioCalendarDate(reference),
): string | null {
  if (item.sessionDate !== null) {
    return resolveStudioCalendarDateFromSessionDate(item.sessionDate);
  }
  return getHomeWeeklyScheduleTabCalendarDate(item.dayOfWeek, reference, focusDateIso);
}
