import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import {
  isReleasableBookingStatus,
  shouldOpenSlotAfterRelease,
} from './bookings-slot.helpers';

describe('isReleasableBookingStatus', () => {
  it('allows booked, completed, and missed', () => {
    expect(isReleasableBookingStatus(BookingStatus.BOOKED)).toBe(true);
    expect(isReleasableBookingStatus(BookingStatus.COMPLETED)).toBe(true);
    expect(isReleasableBookingStatus(BookingStatus.MISSED)).toBe(true);
  });

  it('rejects cancelled bookings', () => {
    expect(isReleasableBookingStatus(BookingStatus.CANCELLED)).toBe(false);
  });
});

describe('shouldOpenSlotAfterRelease', () => {
  const now = new Date('2026-09-03T12:00:00.000Z');

  it('opens the slot for an upcoming booked session', () => {
    expect(
      shouldOpenSlotAfterRelease({
        previousStatus: BookingStatus.BOOKED,
        sessionStatus: ClassSessionStatus.ACTIVE,
        endsAt: new Date('2026-09-03T13:00:00.000Z'),
        now,
      }),
    ).toBe(true);
  });

  it('skips waitlist and capacity for completed or missed', () => {
    expect(
      shouldOpenSlotAfterRelease({
        previousStatus: BookingStatus.COMPLETED,
        sessionStatus: ClassSessionStatus.FINISHED,
        endsAt: new Date('2026-09-03T11:00:00.000Z'),
        now,
      }),
    ).toBe(false);
    expect(
      shouldOpenSlotAfterRelease({
        previousStatus: BookingStatus.MISSED,
        sessionStatus: ClassSessionStatus.ACTIVE,
        endsAt: new Date('2026-09-03T13:00:00.000Z'),
        now,
      }),
    ).toBe(false);
  });

  it('skips finished or cancelled classes', () => {
    expect(
      shouldOpenSlotAfterRelease({
        previousStatus: BookingStatus.BOOKED,
        sessionStatus: ClassSessionStatus.FINISHED,
        now,
      }),
    ).toBe(false);
    expect(
      shouldOpenSlotAfterRelease({
        previousStatus: BookingStatus.BOOKED,
        sessionStatus: ClassSessionStatus.CANCELLED,
        now,
      }),
    ).toBe(false);
  });

  it('skips a booked session whose end time has passed', () => {
    expect(
      shouldOpenSlotAfterRelease({
        previousStatus: BookingStatus.BOOKED,
        sessionStatus: ClassSessionStatus.ACTIVE,
        endsAt: new Date('2026-09-03T11:00:00.000Z'),
        now,
      }),
    ).toBe(false);
  });
});
