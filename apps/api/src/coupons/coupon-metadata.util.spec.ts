import {
  couponBlocksPackageRefund,
  couponBlocksSucceededPackageUndo,
} from './coupon-metadata.util';

const snapshot = {
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
};

describe('couponBlocksPackageRefund', () => {
  it('blocks package purchases and carts that include a package', () => {
    expect(couponBlocksPackageRefund('PACKAGE', snapshot)).toBe(true);
    expect(
      couponBlocksPackageRefund('OTHER', {
        ...snapshot,
        packagePlanId: 'plan-1',
      }),
    ).toBe(true);
  });

  it('blocks failing a succeeded coupon package, and still allows a pending failure', () => {
    expect(
      couponBlocksSucceededPackageUndo(
        'PACKAGE',
        snapshot,
        'SUCCEEDED',
        'FAILED',
      ),
    ).toBe(true);
    expect(
      couponBlocksSucceededPackageUndo(
        'PACKAGE',
        snapshot,
        'SUCCEEDED',
        'REFUNDED',
      ),
    ).toBe(true);
    expect(
      couponBlocksSucceededPackageUndo(
        'PACKAGE',
        snapshot,
        'PENDING',
        'FAILED',
      ),
    ).toBe(false);
  });

  it('leaves drop-in and gift refunds to their existing rules', () => {
    expect(couponBlocksPackageRefund('DROPIN', snapshot)).toBe(false);
    expect(couponBlocksPackageRefund('GIFT', snapshot)).toBe(false);
    expect(couponBlocksPackageRefund('PACKAGE', {})).toBe(false);
  });
});
