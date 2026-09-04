import { resolveSessionBookingEligibilityStatus } from './resolve-session-booking-eligibility';

describe('resolveSessionBookingEligibilityStatus', () => {
  it('returns included when a package can book', () => {
    expect(
      resolveSessionBookingEligibilityStatus({
        packages: [{ canBook: true }],
        hasPurchasePlans: false,
      }),
    ).toBe('included');
  });

  it('returns purchase_required when no bookable package but plans exist', () => {
    expect(
      resolveSessionBookingEligibilityStatus({
        packages: [{ canBook: false }],
        hasPurchasePlans: true,
      }),
    ).toBe('purchase_required');
  });

  it('returns null when neither bookable nor purchasable', () => {
    expect(
      resolveSessionBookingEligibilityStatus({
        packages: [],
        hasPurchasePlans: false,
      }),
    ).toBeNull();
  });
});
