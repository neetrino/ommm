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

/** Week view used on the schedule strip: Sunday → Saturday (matches reference UI). */
export function startOfWeekSunday(input: Date): Date {
  const d = startOfLocalDay(input);
  return addDays(d, -d.getDay());
}
