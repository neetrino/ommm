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

  it('stays open inside 12 hours when the class is after 10:00 studio time', () => {
    const afternoon = new Date('2026-10-21T08:00:00.000Z');
    const now = new Date('2026-10-21T06:00:00.000Z');
    expect(isMemberBookingClosed(afternoon, now)).toBe(false);
  });

  it('closes an 08:00 studio class inside the 12 hour window', () => {
    const early = new Date('2026-10-21T04:00:00.000Z');
    const now = new Date('2026-10-20T16:30:00.000Z');
    expect(isMemberBookingClosed(early, now)).toBe(true);
  });
});
