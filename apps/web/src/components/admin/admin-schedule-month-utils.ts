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

/**
 * Monday-first month grid cells: `null` for leading/trailing padding, ISO days for in-month dates.
 */
export function buildMondayFirstMonthCells(yearMonth: string): Array<string | null> {
  const { year, monthIndex } = parseYearMonth(yearMonth);
  const firstOfMonth = new Date(year, monthIndex, 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: Array<string | null> = [];

  for (let index = 0; index < mondayOffset; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toLocalIsoDate(new Date(year, monthIndex, day)));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

/** Short weekday labels Mon→Sun for the given locale. */
export function mondayFirstWeekdayLabels(locale: string): string[] {
  const monday = new Date(2024, 0, 1);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
  });
}
