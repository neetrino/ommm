import { BadRequestException } from '@nestjs/common';
import { utcToStudioWallClockTime } from '../common/studio-timezone';

/** Members cannot book once an early class is inside this window. */
export const MEMBER_BOOKING_CLOSE_HOURS = 12;

/** Inclusive studio start (Asia/Yerevan) that uses the 12-hour close. */
const EARLY_CLASS_START_MINUTES = 8 * 60;

/** Inclusive studio end (Asia/Yerevan) that uses the 12-hour close. */
const EARLY_CLASS_END_MINUTES = 10 * 60;

const MS_PER_HOUR = 60 * 60 * 1000;

/** True for classes that start from 08:00 through 10:00 studio time. */
function isEarlyMorningClass(startsAt: Date): boolean {
  const [hourText, minuteText] = utcToStudioWallClockTime(startsAt).split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const minutesOfDay = hour === 24 ? minute : hour * 60 + minute;
  return (
    minutesOfDay >= EARLY_CLASS_START_MINUTES &&
    minutesOfDay <= EARLY_CLASS_END_MINUTES
  );
}

/**
 * True when booking is closed: the class has started, or it is an 08:00–10:00
 * class inside {@link MEMBER_BOOKING_CLOSE_HOURS}.
 */
export function isMemberBookingClosed(
  startsAt: Date,
  now: Date = new Date(),
): boolean {
  if (startsAt.getTime() <= now.getTime()) {
    return true;
  }
  if (!isEarlyMorningClass(startsAt)) {
    return false;
  }
  return (
    startsAt.getTime() - now.getTime() <
    MEMBER_BOOKING_CLOSE_HOURS * MS_PER_HOUR
  );
}

/** Rejects member booking after the class has started or inside the close window. */
export function assertMemberBookingWindow(
  startsAt: Date,
  now: Date = new Date(),
): void {
  if (startsAt.getTime() <= now.getTime()) {
    throw new BadRequestException('Session already started');
  }
  if (isMemberBookingClosed(startsAt, now)) {
    throw new BadRequestException('Booking closes 12 hours before the class');
  }
}
