import { checkoutAttemptMatches } from './payments-pending-reuse.util';

const couponMetadata = {
  coupon: {
    couponId: 'c1',
    code: 'HELEN20',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    createdById: 'staff-1',
    originalAmountCents: 15_000,
    discountAmountCents: 3_000,
    remainderGiftCents: 0,
    amountAfterCouponCents: 12_000,
  },
  giftCreditsAppliedCents: 2_000,
};

describe('checkoutAttemptMatches', () => {
  it('reuses a pending attempt only when amount, gift credit, and coupon match', () => {
    const payment = { amountCents: 10_000, metadata: couponMetadata };
    expect(
      checkoutAttemptMatches(payment, {
        chargeCents: 10_000,
        appliedGiftCents: 2_000,
        couponId: 'c1',
      }),
    ).toBe(true);
    expect(
      checkoutAttemptMatches(payment, {
        chargeCents: 10_000,
        appliedGiftCents: 2_000,
        couponId: null,
      }),
    ).toBe(false);
  });
});
