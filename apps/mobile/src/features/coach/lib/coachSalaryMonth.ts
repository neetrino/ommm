import { STUDIO_TIMEZONE } from "../../../lib/studioTimezone";

export const COACH_SALARY_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const STUDIO_CALENDAR_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: STUDIO_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Studio calendar month (`YYYY-MM`) used by salary periods. */
export function currentStudioSalaryMonth(now: Date = new Date()): string {
  return STUDIO_CALENDAR_DATE.format(now).slice(0, 7);
}

export function addSalaryMonths(yearMonth: string, deltaMonths: number): string {
  const year = Number(yearMonth.slice(0, 4));
  const monthIndex = Number(yearMonth.slice(5, 7)) - 1;
  const date = new Date(year, monthIndex + deltaMonths, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function dateFromSalaryMonth(yearMonth: string): Date {
  const year = Number(yearMonth.slice(0, 4));
  const monthIndex = Number(yearMonth.slice(5, 7)) - 1;
  return new Date(year, monthIndex, 1);
}

export function parseCoachSalaryMonthParam(
  raw: string | undefined,
  now: Date = new Date(),
): string {
  const current = currentStudioSalaryMonth(now);
  if (!raw || !COACH_SALARY_MONTH_PATTERN.test(raw) || raw > current) {
    return current;
  }
  return raw;
}
