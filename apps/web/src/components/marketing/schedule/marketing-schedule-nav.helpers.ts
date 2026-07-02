import {
  SCHEDULE_DATE_STRIP_VISIBLE_DAYS,
} from "@/components/marketing/schedule/schedule-date-controls";
import {
  addDays,
  compareCalendarDays,
  isBeforeCalendarDay,
  startOfLocalDay,
  startOfWeekSunday,
} from "@/components/marketing/schedule/schedule-date-utils";

export type MarketingScheduleNavState = {
  windowStart: Date;
  selectedDate: Date;
};

export function buildMarketingScheduleInitialNav(baseline: Date): MarketingScheduleNavState {
  const windowStart = startOfWeekSunday(baseline);
  return { windowStart, selectedDate: baseline };
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
