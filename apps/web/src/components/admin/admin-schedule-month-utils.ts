import { toLocalIsoDate } from "@/lib/local-iso-date";

/** `YYYY-MM` from an ISO calendar day (`YYYY-MM-DD`). */
export function yearMonthFromIsoDay(isoDay: string): string {
  return isoDay.slice(0, 7);
}

function parseYearMonth(yearMonth: string): { year: number; monthIndex: number } {
  const year = Number(yearMonth.slice(0, 4));
  const monthIndex = Number(yearMonth.slice(5, 7)) - 1;
  return { year, monthIndex };
}

export function formatYearMonth(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export function addCalendarMonths(yearMonth: string, deltaMonths: number): string {
  const { year, monthIndex } = parseYearMonth(yearMonth);
  const date = new Date(year, monthIndex + deltaMonths, 1);
  return formatYearMonth(date.getFullYear(), date.getMonth());
}

/** Inclusive ISO day bounds for a `YYYY-MM` calendar month. */
export function monthBoundsIso(yearMonth: string): { from: string; to: string } {
  const { year, monthIndex } = parseYearMonth(yearMonth);
  const from = toLocalIsoDate(new Date(year, monthIndex, 1));
  const to = toLocalIsoDate(new Date(year, monthIndex + 1, 0));
  return { from, to };
}

/** Display title for a `YYYY-MM` value in the given locale (e.g. "August 2026"). */
export function formatMonthTitle(locale: string, yearMonth: string): string {
  const date = new Date(`${yearMonth}-01T00:00:00`);
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
}
