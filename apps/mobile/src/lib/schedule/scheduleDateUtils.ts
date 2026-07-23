/** Local calendar helpers — mirrors web `schedule-date-utils.ts`. */
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

export function startOfWeekSunday(input: Date): Date {
  const d = startOfLocalDay(input);
  return addDays(d, -d.getDay());
}
