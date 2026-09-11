import { addDays, startOfLocalDay } from "../../../lib/schedule/scheduleDateUtils";
import type { CoachPanelSessionRow } from "../types/coachPanel";

export type CoachScheduleViewMode = "list" | "weekly" | "monthly";

export const COACH_SCHEDULE_VIEW_MODES: readonly CoachScheduleViewMode[] = [
  "list",
  "weekly",
  "monthly",
];

/** Matches web `SCHEDULE_WEEK_PAST_DAYS` so coaches can scroll left into history. */
export const COACH_SCHEDULE_WEEK_PAST_DAYS = 28;

/** Today plus the next six days on the week board. */
export const COACH_SCHEDULE_WEEK_FORWARD_DAYS = 6;

export function localIsoDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function sessionLocalIsoDay(startsAt: string): string {
  return localIsoDay(new Date(startsAt));
}

export function buildCoachScheduleWeekDays(anchor: Date = new Date()): Date[] {
  const today = startOfLocalDay(anchor);
  const start = addDays(today, -COACH_SCHEDULE_WEEK_PAST_DAYS);
  const total = COACH_SCHEDULE_WEEK_PAST_DAYS + 1 + COACH_SCHEDULE_WEEK_FORWARD_DAYS;
  return Array.from({ length: total }, (_, index) => addDays(start, index));
}

export function groupCoachSessionsByDay(
  rows: readonly CoachPanelSessionRow[],
): Map<string, CoachPanelSessionRow[]> {
  const map = new Map<string, CoachPanelSessionRow[]>();
  for (const row of rows) {
    const key = sessionLocalIsoDay(row.startsAt);
    const current = map.get(key) ?? [];
    current.push(row);
    map.set(key, current);
  }
  for (const [key, value] of map) {
    map.set(
      key,
      [...value].sort((left, right) => left.startsAt.localeCompare(right.startsAt)),
    );
  }
  return map;
}

export function isCoachSessionOnPastDay(startsAt: string, today: Date = new Date()): boolean {
  return sessionLocalIsoDay(startsAt) < localIsoDay(startOfLocalDay(today));
}

export function coachScheduleWeekdayLabels(locale: string): string[] {
  const sunday = new Date(2024, 0, 7);
  return Array.from({ length: 7 }, (_, index) => {
    const sample = new Date(sunday);
    sample.setDate(sunday.getDate() + index);
    return new Intl.DateTimeFormat(locale, { weekday: "short" })
      .format(sample)
      .toUpperCase();
  });
}
