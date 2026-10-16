import { purchaseMatchesCouponProducts } from './coupon-eligibility.util';

describe('purchaseMatchesCouponProducts', () => {
  it('accepts any checkout when products are unrestricted', () => {
    expect(
      purchaseMatchesCouponProducts({
        eligibleAllProducts: true,
        rules: [],
        lines: [{ kind: 'GIFT' }],
      }),
    ).toBe(true);
  });

  it('matches a package plan across a package purchase and a gifted plan', () => {
    const rules = [
      { productKind: 'PACKAGE' as const, packagePlanId: 'plan-1' },
    ];
    expect(
      purchaseMatchesCouponProducts({
        eligibleAllProducts: false,
        rules,
        lines: [{ kind: 'PACKAGE', packagePlanId: 'plan-1' }],
      }),
    ).toBe(true);
    expect(
      purchaseMatchesCouponProducts({
        eligibleAllProducts: false,
        rules,
        lines: [{ kind: 'GIFT', packagePlanId: 'plan-1' }],
      }),
    ).toBe(true);
  });

  it('rejects a cart that includes a product outside the coupon', () => {
    expect(
      purchaseMatchesCouponProducts({
        eligibleAllProducts: false,
        rules: [{ productKind: 'PACKAGE', packagePlanId: 'plan-1' }],
        lines: [{ kind: 'PACKAGE', packagePlanId: 'plan-1' }, { kind: 'BAR' }],
      }),
    ).toBe(false);
  });
});
