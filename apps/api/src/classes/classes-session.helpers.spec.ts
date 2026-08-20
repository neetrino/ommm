import { BookingStatus } from '@prisma/client';
import { ADMIN_SESSION_INCLUDE } from './classes-session.helpers';

describe('ADMIN_SESSION_INCLUDE', () => {
  it('counts occupied bookings so past classes still show attendees', () => {
    expect(
      ADMIN_SESSION_INCLUDE._count.select.bookings.where.status.in,
    ).toEqual([
      BookingStatus.BOOKED,
      BookingStatus.COMPLETED,
      BookingStatus.MISSED,
    ]);
  });
});
