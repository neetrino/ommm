import { SCHEDULE_DATE_STRIP_VISIBLE_DAYS } from "@/components/marketing/schedule/schedule-date-controls";
import {
  addDays,
  compareCalendarDays,
  isBeforeCalendarDay,
  startOfLocalDay,
  startOfWeekSunday,
} from "@/components/marketing/schedule/schedule-date-utils";
import { calendarDateToMarketingLocalDay } from "@/components/marketing/schedule/marketing-schedule-item.helpers";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { isUpcomingPublicScheduleSession } from "@/lib/filter-public-schedule-items";
import { resolveStudioCalendarDateFromSessionDate } from "@/lib/studio-timezone";

/** Deep-link selected day on the public schedule page (`/schedule?date=YYYY-MM-DD`). */
export const PUBLIC_SCHEDULE_DATE_QUERY_KEY = "date";

export type MarketingScheduleNavState = {
  windowStart: Date;
  selectedDate: Date;
};

export function buildMarketingScheduleInitialNav(baseline: Date): MarketingScheduleNavState {
  const windowStart = startOfWeekSunday(baseline);
  return { windowStart, selectedDate: baseline };
}

/**
 * Picks the nearest upcoming session calendar day (studio date) at/after `baseline`.
 * Falls back to `baseline` when no upcoming sessions exist.
 */
export function resolveNearestUpcomingScheduleDate(
  items: readonly MarketingScheduleItem[],
  baseline: Date,
  now: Date = new Date(),
): Date {
  const baselineDay = startOfLocalDay(baseline);
  let nearest: Date | null = null;

  for (const item of items) {
    if (!item.isActive || item.sessionDate === null) {
      continue;
    }
    if (!isUpcomingPublicScheduleSession(item, now)) {
      continue;
    }

    const sessionDayIso = resolveStudioCalendarDateFromSessionDate(item.sessionDate);
    if (sessionDayIso === null) {
      continue;
    }

    const sessionDay = calendarDateToMarketingLocalDay(sessionDayIso);
    if (isBeforeCalendarDay(sessionDay, baselineDay)) {
      continue;
    }

    if (nearest === null || compareCalendarDays(sessionDay, nearest) < 0) {
      nearest = sessionDay;
    }
  }

  return nearest ?? baselineDay;
}

/** Initial nav: today, or the nearest day that still has upcoming classes. */
export function buildMarketingScheduleInitialNavFromItems(
  baseline: Date,
  items: readonly MarketingScheduleItem[],
  now: Date = new Date(),
): MarketingScheduleNavState {
  const selectedDate = resolveNearestUpcomingScheduleDate(items, baseline, now);
  return {
    windowStart: startOfWeekSunday(selectedDate),
    selectedDate,
  };
}

/** Builds nav so `dateIso` (YYYY-MM-DD) is selected and visible in the week strip. */
export function buildMarketingScheduleNavForDate(
  dateIso: string,
  today: Date,
): MarketingScheduleNavState | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso.trim());
  if (match === null) {
    return null;
  }

  const requested = calendarDateToMarketingLocalDay(dateIso);
  if (Number.isNaN(requested.getTime())) {
    return null;
  }

  const todayStart = startOfLocalDay(today);
  const selectedDate = isBeforeCalendarDay(requested, todayStart) ? todayStart : requested;

  return {
    windowStart: startOfWeekSunday(selectedDate),
    selectedDate,
  };
}

export function buildPublicScheduleHrefForDate(dateIso: string): string {
  return `/schedule?${PUBLIC_SCHEDULE_DATE_QUERY_KEY}=${encodeURIComponent(dateIso)}`;
}

/** Empty arrays mean “all” — same as the mobile schedule filters. */
export function matchesMarketingScheduleFilters(
  item: MarketingScheduleItem,
  classTypes: readonly string[],
  instructors: readonly string[],
): boolean {
  if (classTypes.length > 0 && !classTypes.includes(item.classType)) {
    return false;
  }
  if (instructors.length > 0 && !instructors.includes(item.instructorName)) {
    return false;
  }
  return true;
}

export function shiftMarketingScheduleWeek(
  prev: MarketingScheduleNavState,
  deltaDays: number,
  today: Date,
): MarketingScheduleNavState {
  if (
    deltaDays < 0 &&
    compareCalendarDays(
      addDays(prev.windowStart, deltaDays + SCHEDULE_DATE_STRIP_VISIBLE_DAYS - 1),
      today,
    ) < 0
  ) {
    return prev;
  }

  const nextWs = addDays(prev.windowStart, deltaDays);
  const first = startOfLocalDay(nextWs);
  const last = addDays(first, 6);
  const sel = startOfLocalDay(prev.selectedDate);
  const outOfRange = sel.getTime() < first.getTime() || sel.getTime() > last.getTime();
  const nextSelected = outOfRange ? first : prev.selectedDate;
  const clampedSelected = isBeforeCalendarDay(nextSelected, today) ? today : nextSelected;

  return {
    windowStart: nextWs,
    selectedDate: clampedSelected,
  };
}
