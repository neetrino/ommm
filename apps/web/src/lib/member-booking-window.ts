import { resolvePublicScheduleSessionStart } from "@/lib/filter-public-schedule-items";

/** Matches API `MEMBER_BOOKING_CLOSE_HOURS`. */
export const MEMBER_BOOKING_CLOSE_HOURS = 12;

const MS_PER_HOUR = 60 * 60 * 1000;

/** True when a member can no longer book this class start. */
export function isMemberBookingClosedAt(
  startsAt: Date,
  now: Date = new Date(),
): boolean {
  return startsAt.getTime() - now.getTime() < MEMBER_BOOKING_CLOSE_HOURS * MS_PER_HOUR;
}

/** True when the public schedule row is inside the member booking close window. */
export function isMemberBookingClosed(
  sessionDate: string | null | undefined,
  startTime: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (sessionDate == null || startTime == null || startTime.length === 0) {
    return false;
  }
  const start = resolvePublicScheduleSessionStart({ sessionDate, startTime });
  if (start === null) {
    return false;
  }
  return isMemberBookingClosedAt(start, now);
}
