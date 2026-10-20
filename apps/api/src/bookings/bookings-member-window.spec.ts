import { isMemberBookingClosed } from './bookings-member-window';

describe('isMemberBookingClosed', () => {
  const startsAt = new Date('2026-10-21T06:00:00.000Z');

  it('stays open more than 12 hours before the class', () => {
    const now = new Date('2026-10-20T17:59:00.000Z');
    expect(isMemberBookingClosed(startsAt, now)).toBe(false);
  });

  it('closes inside the 12 hour window', () => {
    const now = new Date('2026-10-20T18:01:00.000Z');
    expect(isMemberBookingClosed(startsAt, now)).toBe(true);
  });

  it('stays closed after the class has started', () => {
    const now = new Date('2026-10-21T06:01:00.000Z');
    expect(isMemberBookingClosed(startsAt, now)).toBe(true);
  });
});
