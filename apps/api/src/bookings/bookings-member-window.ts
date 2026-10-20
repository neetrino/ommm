import { BadRequestException } from '@nestjs/common';

/** Members cannot book once the class is inside this window. */
export const MEMBER_BOOKING_CLOSE_HOURS = 12;

const MS_PER_HOUR = 60 * 60 * 1000;

/** True when the class starts in less than {@link MEMBER_BOOKING_CLOSE_HOURS}. */
export function isMemberBookingClosed(
  startsAt: Date,
  now: Date = new Date(),
): boolean {
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
