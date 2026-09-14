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

/** Home weekly schedule shows today through today + 6 (rolling week). */
export const HOME_WEEKLY_SCHEDULE_ROLLING_DAY_COUNT = 7;

export type HomeWeeklyScheduleRollingTab = {
  day: MarketingScheduleDayOfWeek;
  calendarDate: string;
};

/** Studio calendar day-of-week for a `YYYY-MM-DD` date. */
export function studioCalendarDateToDayOfWeek(
  calendarDateIso: string,
): MarketingScheduleDayOfWeek {
  return utcToStudioDayOfWeek(studioWallClockToUtc(calendarDateIso, "12:00"));
}

/**
 * Rolling day tabs starting at studio today: today, tomorrow, …, today+6.
 * Past weekdays are omitted; the same weekday from next week appears at the end.
 */
export function listHomeWeeklyScheduleRollingTabs(
  reference: Date = new Date(),
): readonly HomeWeeklyScheduleRollingTab[] {
  const todayIso = utcToStudioCalendarDate(reference);
  return Array.from({ length: HOME_WEEKLY_SCHEDULE_ROLLING_DAY_COUNT }, (_, offset) => {
    const calendarDate = addStudioCalendarDays(todayIso, offset);
    return {
      day: studioCalendarDateToDayOfWeek(calendarDate),
      calendarDate,
    };
  });
}

/**
 * Nearest upcoming session calendar day within the rolling home window
 * (studio today … today+6). Falls back to today when none exist in range.
 */
export function resolveHomeWeeklyScheduleFocusDate(
  items: readonly Pick<MarketingScheduleItem, "sessionDate" | "isActive">[],
  reference: Date = new Date(),
): string {
  const todayIso = utcToStudioCalendarDate(reference);
  const windowEndIso = addStudioCalendarDays(
    todayIso,
    HOME_WEEKLY_SCHEDULE_ROLLING_DAY_COUNT - 1,
  );
  let nearest: string | null = null;

  for (const item of items) {
    if (!item.isActive || item.sessionDate === null) {
      continue;
    }
    const sessionDay = resolveStudioCalendarDateFromSessionDate(item.sessionDate);
    if (
      sessionDay === null ||
      sessionDay < todayIso ||
      sessionDay > windowEndIso
    ) {
      continue;
    }
    if (nearest === null || sessionDay < nearest) {
      nearest = sessionDay;
    }
  }

  return nearest ?? todayIso;
}

/**
 * Studio calendar date for a weekday tab in the rolling window starting at studio today.
 * The window is always anchored to `reference` (today), not a distant focus week.
 */
export function getHomeWeeklyScheduleTabCalendarDate(
  day: MarketingScheduleDayOfWeek,
  reference: Date = new Date(),
): string {
  const tab = listHomeWeeklyScheduleRollingTabs(reference).find(
    (entry) => entry.day === day,
  );
  if (tab === undefined) {
    return utcToStudioCalendarDate(reference);
  }
  return tab.calendarDate;
}

/** Studio calendar date for a schedule row (exact API date or rolling-tab weekday fallback). */
export function resolveHomeWeeklyScheduleItemCalendarDate(
  item: MarketingScheduleItem,
  reference: Date = new Date(),
): string | null {
  if (item.sessionDate !== null) {
    return resolveStudioCalendarDateFromSessionDate(item.sessionDate);
  }
  return getHomeWeeklyScheduleTabCalendarDate(item.dayOfWeek, reference);
}
