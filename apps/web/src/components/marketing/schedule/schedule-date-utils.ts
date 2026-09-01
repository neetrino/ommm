/** Local calendar helpers for the public schedule view (no external date libs). */
export function startOfLocalDay(input: Date): Date {
  const d = new Date(input);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(input: Date, deltaDays: number): Date {
  const d = new Date(input);
  d.setDate(d.getDate() + deltaDays);
  return d;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function compareCalendarDays(a: Date, b: Date): number {
  return startOfLocalDay(a).getTime() - startOfLocalDay(b).getTime();
}

export function isBeforeCalendarDay(a: Date, b: Date): boolean {
  return compareCalendarDays(a, b) < 0;
}

export function isAfterCalendarDay(a: Date, b: Date): boolean {
  return compareCalendarDays(a, b) > 0;
}

export function compareTimeOfDay(
  aHour: number,
  aMinute: number,
  bHour: number,
  bMinute: number,
): number {
  const av = aHour * 60 + aMinute;
  const bv = bHour * 60 + bMinute;
  return av - bv;
}

export function formatScheduleMonthTitle(locale: string, date: Date): string {
  return new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
}

/** Week view used on the schedule strip: Sunday → Saturday (matches reference UI). */
export function startOfWeekSunday(input: Date): Date {
  const d = startOfLocalDay(input);
  return addDays(d, -d.getDay());
}

export function startOfLocalMonth(input: Date): Date {
  return startOfLocalDay(new Date(input.getFullYear(), input.getMonth(), 1));
}

export function addMonths(input: Date, deltaMonths: number): Date {
  return startOfLocalDay(
    new Date(input.getFullYear(), input.getMonth() + deltaMonths, 1),
  );
}

export function isSameCalendarMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_WEEK = 7;

/** Sunday-start weeks covering the local month of `monthAnchor`. */
export function buildMonthWeeks(monthAnchor: Date): Date[][] {
  const monthStart = startOfLocalMonth(monthAnchor);
  const monthEnd = startOfLocalDay(
    new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0),
  );
  const gridStart = startOfWeekSunday(monthStart);
  const gridEnd = addDays(startOfWeekSunday(monthEnd), 6);
  const totalDays =
    Math.floor(compareCalendarDays(gridEnd, gridStart) / MS_PER_DAY) + 1;
  const days = Array.from({ length: Math.max(totalDays, 1) }, (_, idx) =>
    addDays(gridStart, idx),
  );
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += DAYS_PER_WEEK) {
    weeks.push(days.slice(i, i + DAYS_PER_WEEK));
  }
  return weeks;
}
