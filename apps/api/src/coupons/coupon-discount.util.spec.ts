import { quoteCouponDiscount } from './coupon-discount.util';

describe('quoteCouponDiscount', () => {
  it('applies a percentage once and keeps no balance', () => {
    expect(
      quoteCouponDiscount({
        subtotalCents: 15_000,
        discountType: 'PERCENTAGE',
        discountValue: 20,
      }),
    ).toEqual({
      discountCents: 3_000,
      remainderGiftCents: 0,
      amountAfterCouponCents: 12_000,
    });
  });

  it('moves the unused fixed amount to gift credit and never goes negative', () => {
    expect(
      quoteCouponDiscount({
        subtotalCents: 15_000,
        discountType: 'FIXED_AMOUNT',
        discountValue: 20_000,
      }),
    ).toEqual({
      discountCents: 15_000,
      remainderGiftCents: 5_000,
      amountAfterCouponCents: 0,
    });
  });

  it('uses the whole fixed amount when the purchase is larger', () => {
    expect(
      quoteCouponDiscount({
        subtotalCents: 30_000,
        discountType: 'FIXED_AMOUNT',
        discountValue: 20_000,
      }),
    ).toEqual({
      discountCents: 20_000,
      remainderGiftCents: 0,
      amountAfterCouponCents: 10_000,
    });
  });
});
