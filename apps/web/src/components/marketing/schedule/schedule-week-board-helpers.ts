import {
  addDays,
  startOfLocalDay,
} from "@/components/marketing/schedule/schedule-date-utils";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { toLocalIsoDate } from "@/lib/local-iso-date";

export type DayPeriod = "morning" | "afternoon" | "evening";

export type ScheduleWeekColumn = {
  day: Date;
  dayKey: string;
};

const WEEK_SHIFT_DAYS = 7;
const AFTERNOON_START_MINUTES = 12 * 60;
const EVENING_START_MINUTES = 17 * 60;
const PERIOD_ORDER: readonly DayPeriod[] = ["morning", "afternoon", "evening"];

function parseStartMinutes(startTime: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(startTime.trim());
  if (match === null) {
    return 0;
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

export function resolveDayPeriod(startTime: string): DayPeriod {
  const minutes = parseStartMinutes(startTime);
  if (minutes < AFTERNOON_START_MINUTES) {
    return "morning";
  }
  if (minutes < EVENING_START_MINUTES) {
    return "afternoon";
  }
  return "evening";
}

/** Prefer en-US so English week chips keep `Sun 8/30` style. */
function resolveScheduleIntlLocale(locale: string): string {
  return locale === "en" ? "en-US" : locale;
}

function capitalizeLocaleLabel(locale: string, value: string): string {
  if (value.length === 0) {
    return value;
  }
  const lower = value.toLocaleLowerCase(locale);
  return lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1);
}

export function formatScheduleWeekRangeLabel(
  locale: string,
  windowStart: Date,
): string {
  const intlLocale = resolveScheduleIntlLocale(locale);
  const weekEnd = addDays(windowStart, WEEK_SHIFT_DAYS - 1);
  const weekdayFmt = new Intl.DateTimeFormat(intlLocale, { weekday: "short" });
  const dayMonthFmt = new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "numeric",
  });
  const formatChip = (date: Date): string => {
    const weekday = capitalizeLocaleLabel(intlLocale, weekdayFmt.format(date));
    return `${weekday} ${dayMonthFmt.format(date)}`;
  };
  return `${formatChip(windowStart)} - ${formatChip(weekEnd)}`;
}

export function buildScheduleWeekColumns(windowStart: Date): ScheduleWeekColumn[] {
  return Array.from({ length: 7 }, (_, idx) => {
    const day = startOfLocalDay(addDays(windowStart, idx));
    return { day, dayKey: toLocalIsoDate(day) };
  });
}

export function groupSessionsByDayAndPeriod(
  sessions: readonly MarketingScheduleItem[],
): Map<string, MarketingScheduleItem[]> {
  const map = new Map<string, MarketingScheduleItem[]>();
  for (const item of sessions) {
    if (item.sessionDate === null) {
      continue;
    }
    const key = `${item.sessionDate}:${resolveDayPeriod(item.startTime)}`;
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
  return map;
}

/** Tallest day column within a period — used to align card rows via CSS subgrid. */
export function resolvePeriodMaxSessionRows(
  columns: readonly ScheduleWeekColumn[],
  period: DayPeriod,
  sessionsByDayAndPeriod: ReadonlyMap<string, readonly MarketingScheduleItem[]>,
): number {
  let maxRows = 0;
  for (const column of columns) {
    const count =
      sessionsByDayAndPeriod.get(`${column.dayKey}:${period}`)?.length ?? 0;
    if (count > maxRows) {
      maxRows = count;
    }
  }
  return Math.max(1, maxRows);
}

export function resolveVisibleDayPeriods(
  columns: readonly ScheduleWeekColumn[],
  sessionsByDayAndPeriod: ReadonlyMap<string, readonly MarketingScheduleItem[]>,
): DayPeriod[] {
  return PERIOD_ORDER.filter((period) =>
    columns.some((column) => {
      const list = sessionsByDayAndPeriod.get(`${column.dayKey}:${period}`);
      return list !== undefined && list.length > 0;
    }),
  );
}
