import {
  addDays,
  compareCalendarDays,
  isBeforeCalendarDay,
  startOfLocalDay,
  startOfWeekSunday,
} from "./scheduleDateUtils";

export const SCHEDULE_DATE_STRIP_VISIBLE_DAYS = 7;
export const SCHEDULE_DATE_STRIP_WINDOW_SHIFT = 7;

export type ScheduleNavState = {
  windowStart: Date;
  selectedDate: Date;
};

export function buildScheduleInitialNav(baseline: Date): ScheduleNavState {
  const windowStart = startOfWeekSunday(baseline);
  return { windowStart, selectedDate: baseline };
}

export function shiftScheduleDateWindow(
  prev: ScheduleNavState,
  deltaDays: number,
  today: Date,
): ScheduleNavState {
  if (
    deltaDays < 0 &&
    compareCalendarDays(
      addDays(prev.windowStart, deltaDays + SCHEDULE_DATE_STRIP_VISIBLE_DAYS - 1),
      today,
    ) < 0
  ) {
    return prev;
  }

  const nextWindowStart = addDays(prev.windowStart, deltaDays);
  const first = startOfLocalDay(nextWindowStart);
  const last = addDays(first, SCHEDULE_DATE_STRIP_VISIBLE_DAYS - 1);
  const selected = startOfLocalDay(prev.selectedDate);
  const outOfRange = selected.getTime() < first.getTime() || selected.getTime() > last.getTime();
  const nextSelected = outOfRange ? first : prev.selectedDate;
  const clampedSelected = isBeforeCalendarDay(nextSelected, today) ? today : nextSelected;

  return {
    windowStart: nextWindowStart,
    selectedDate: clampedSelected,
  };
}
