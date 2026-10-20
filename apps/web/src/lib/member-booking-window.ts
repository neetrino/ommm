import { resolvePublicScheduleSessionStart } from "@/lib/filter-public-schedule-items";
import { utcToStudioWallClockTime } from "@/lib/studio-timezone";

/** Matches API `MEMBER_BOOKING_CLOSE_HOURS`. */
export const MEMBER_BOOKING_CLOSE_HOURS = 12;

/** Inclusive studio start (Asia/Yerevan) that uses the 12-hour close. */
const EARLY_CLASS_START_MINUTES = 8 * 60;

/** Inclusive studio end (Asia/Yerevan) that uses the 12-hour close. */
const EARLY_CLASS_END_MINUTES = 10 * 60;

const MS_PER_HOUR = 60 * 60 * 1000;

/** True for classes that start from 08:00 through 10:00 studio time. */
function isEarlyMorningClass(startsAt: Date): boolean {
  const [hourText, minuteText] = utcToStudioWallClockTime(startsAt).split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const minutesOfDay = hour === 24 ? minute : hour * 60 + minute;
  return (
    minutesOfDay >= EARLY_CLASS_START_MINUTES && minutesOfDay <= EARLY_CLASS_END_MINUTES
  );
}

/** True when a member can no longer book this class start. */
export function isMemberBookingClosedAt(
  startsAt: Date,
  now: Date = new Date(),
): boolean {
  if (startsAt.getTime() <= now.getTime()) {
    return true;
  }
  if (!isEarlyMorningClass(startsAt)) {
    return false;
  }
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
