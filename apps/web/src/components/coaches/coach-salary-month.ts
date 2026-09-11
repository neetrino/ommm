import { utcToStudioCalendarDate } from "@/lib/studio-timezone";

export const COACH_SALARY_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Studio calendar month (`YYYY-MM`) used by salary periods. */
export function currentStudioSalaryMonth(now: Date = new Date()): string {
  return utcToStudioCalendarDate(now).slice(0, 7);
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
