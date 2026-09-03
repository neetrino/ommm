import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveSessionBookingEligibilityStatus } from './resolve-session-booking-eligibility';

describe('resolveSessionBookingEligibilityStatus', () => {
  it('returns included when a package can book', () => {
    assert.equal(
      resolveSessionBookingEligibilityStatus({
        packages: [{ canBook: true }],
        hasPurchasePlans: false,
      }),
      'included',
    );
  });

  it('returns purchase_required when no bookable package but plans exist', () => {
    assert.equal(
      resolveSessionBookingEligibilityStatus({
        packages: [{ canBook: false }],
        hasPurchasePlans: true,
      }),
      'purchase_required',
    );
  });

  it('returns null when neither bookable nor purchasable', () => {
    assert.equal(
      resolveSessionBookingEligibilityStatus({
        packages: [],
        hasPurchasePlans: false,
      }),
      null,
    );
  });
});
