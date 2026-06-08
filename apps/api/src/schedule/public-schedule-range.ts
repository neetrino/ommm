/** Maximum days ahead exposed on the public marketing schedule endpoint. */
export const PUBLIC_SCHEDULE_RANGE_DAYS = 30;

export type PublicScheduleRange = {
  from: Date;
  to: Date;
};

function startOfLocalDay(input: Date): Date {
  const d = new Date(input);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfLocalDay(input: Date): Date {
  const d = new Date(input);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(input: Date, deltaDays: number): Date {
  const d = new Date(input);
  d.setDate(d.getDate() + deltaDays);
  return d;
}

function parseOptionalDate(value?: string): Date | null {
  if (value === undefined || value.trim().length === 0) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Resolves the effective public schedule window.
 * Defaults to today (start of local day) through today + 30 days (end of day).
 * Client-supplied bounds are clamped to that maximum window.
 */
export function resolvePublicScheduleRange(
  fromParam?: string,
  toParam?: string,
): PublicScheduleRange {
  const todayStart = startOfLocalDay(new Date());
  const maxEnd = endOfLocalDay(addDays(todayStart, PUBLIC_SCHEDULE_RANGE_DAYS));

  const requestedFrom = parseOptionalDate(fromParam) ?? todayStart;
  const requestedTo = parseOptionalDate(toParam) ?? maxEnd;

  const from =
    requestedFrom.getTime() < todayStart.getTime() ? todayStart : requestedFrom;
  let to = requestedTo.getTime() > maxEnd.getTime() ? maxEnd : requestedTo;
  if (to.getTime() < from.getTime()) {
    to = maxEnd;
  }

  return { from, to };
}
