import {
  resolveBookingSessionCredits,
  shouldValidatePackageForBooking,
} from './resolve-booking-session-credits';

describe('resolveBookingSessionCredits', () => {
  it('uses explicit sessionRequirement when set', () => {
    expect(
      resolveBookingSessionCredits({
        session: { priceCents: 0, sessionRequirement: 2 },
      }),
    ).toBe(2);
  });

  it('consumes one credit for paid sessions', () => {
    expect(
      resolveBookingSessionCredits({
        session: { priceCents: 12000, sessionRequirement: null },
      }),
    ).toBe(1);
  });

  it('consumes one credit for free sessions booked with a package', () => {
    expect(
      resolveBookingSessionCredits({
        session: { priceCents: 0, sessionRequirement: null },
        userPackageId: 'pkg-1',
      }),
    ).toBe(1);
  });

  it('does not consume credits for free walk-in bookings', () => {
    expect(
      resolveBookingSessionCredits({
        session: { priceCents: 0, sessionRequirement: null },
      }),
    ).toBe(0);
  });
});

describe('shouldValidatePackageForBooking', () => {
  it('validates when a package id is provided even for free sessions', () => {
    expect(
      shouldValidatePackageForBooking({
        session: { priceCents: 0, sessionRequirement: null },
        userPackageId: 'pkg-1',
      }),
    ).toBe(true);
  });

  it('skips validation for free walk-in bookings', () => {
    expect(
      shouldValidatePackageForBooking({
        session: { priceCents: 0, sessionRequirement: null },
      }),
    ).toBe(false);
  });
});
