import {
  addStudioCalendarDays,
  endOfStudioDayInclusive,
  startOfStudioDay,
  studioWallClockToUtc,
  utcToStudioCalendarDate,
} from '../common/studio-timezone';

/** Maximum days ahead exposed on the public marketing schedule endpoint. */
export const PUBLIC_SCHEDULE_RANGE_DAYS = 30;

export type PublicScheduleRange = {
  from: Date;
  to: Date;
};

function parseOptionalDate(value?: string): Date | null {
  if (value === undefined || value.trim().length === 0) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Resolves the effective public schedule window in the studio timezone.
 * Defaults to today (start of studio day) through today + 30 days (end of day).
 * Client-supplied bounds are clamped to that maximum window.
 */
export function resolvePublicScheduleRange(
  fromParam?: string,
  toParam?: string,
): PublicScheduleRange {
  const reference = new Date();
  const todayStart = startOfStudioDay(reference);
  const maxCalendarDate = addStudioCalendarDays(
    utcToStudioCalendarDate(reference),
    PUBLIC_SCHEDULE_RANGE_DAYS,
  );
  const maxEnd = endOfStudioDayInclusive(
    studioWallClockToUtc(maxCalendarDate, '12:00'),
  );

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

/** Studio calendar day string for cache keying. */
export function publicScheduleCacheDayKey(reference: Date = new Date()): string {
  return utcToStudioCalendarDate(reference);
}
