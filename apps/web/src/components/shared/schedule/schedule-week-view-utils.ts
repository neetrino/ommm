import {
  SCHEDULE_WEEK_COLUMN_GAP_PX,
  SCHEDULE_WEEK_COLUMN_WIDTH_PX,
  SCHEDULE_WEEK_DAY_COUNT,
} from "@/components/shared/schedule/schedule-week-view-tokens";

export function isoScheduleDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addScheduleDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfScheduleDay(date: Date = new Date()): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

/** Rolling week: today plus the next six days. */
export function buildScheduleWeekDayKeys(anchorDate: Date = new Date()): string[] {
  const start = startOfScheduleDay(anchorDate);
  return Array.from({ length: SCHEDULE_WEEK_DAY_COUNT }, (_, index) =>
    isoScheduleDay(addScheduleDays(start, index)),
  );
}

export function isScheduleWeekToday(dayKey: string, anchorDate: Date = new Date()): boolean {
  return dayKey === isoScheduleDay(startOfScheduleDay(anchorDate));
}

export function groupScheduleSessionsByDay<T extends { startsAt: string }>(
  rows: readonly T[],
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const key = row.startsAt.slice(0, 10);
    map.set(key, [...(map.get(key) ?? []), row]);
  }
  for (const [key, value] of map) {
    map.set(
      key,
      value.sort((left, right) => left.startsAt.localeCompare(right.startsAt)),
    );
  }
  return map;
}

export function scheduleWeekTrackMinWidthPx(
  dayCount: number = SCHEDULE_WEEK_DAY_COUNT,
  columnWidthPx: number = SCHEDULE_WEEK_COLUMN_WIDTH_PX,
): number {
  const gaps = Math.max(dayCount - 1, 0) * SCHEDULE_WEEK_COLUMN_GAP_PX;
  return dayCount * columnWidthPx + gaps;
}
