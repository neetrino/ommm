import {
  collectCouponPurchaseIds,
  couponAnalyticsTimeWhere,
  couponPurchaseLabel,
  sessionDisplayName,
} from './coupon-analytics.util';

describe('couponAnalyticsTimeWhere', () => {
  it('keeps a pending reservation visible by its created time', () => {
    const where = couponAnalyticsTimeWhere({
      from: '2026-10-01T00:00:00.000Z',
      to: '2026-10-21T19:59:59.999Z',
    });
    expect(where.OR).toEqual([
      {
        appliedAt: {
          gte: new Date('2026-10-01T00:00:00.000Z'),
          lte: new Date('2026-10-21T19:59:59.999Z'),
        },
      },
      {
        appliedAt: null,
        createdAt: {
          gte: new Date('2026-10-01T00:00:00.000Z'),
          lte: new Date('2026-10-21T19:59:59.999Z'),
        },
      },
    ]);
  });

  it('does not add a date filter when the range is open', () => {
    expect(couponAnalyticsTimeWhere({})).toEqual({});
  });
});

describe('couponPurchaseLabel', () => {
  it('names the package, class, and bar instead of a raw checkout label', () => {
    expect(
      couponPurchaseLabel({
        description: 'Studio cart',
        packageName: 'Morning 8',
        className: 'Reformer',
        barName: 'Water',
      }),
    ).toBe('Morning 8 · Reformer · Water');
  });

  it('drops a drop-in description that is only a session id', () => {
    expect(
      couponPurchaseLabel({
        description: 'Drop-in session cmrb2g4eh0001s601u3jg95zf',
        packageName: null,
        className: 'Reformer',
        barName: null,
      }),
    ).toBe('Reformer');
  });

  it('keeps a package description that already has the plan name', () => {
    expect(
      couponPurchaseLabel({
        description: 'Package: Starter Pack',
        packageName: null,
        className: null,
        barName: null,
      }),
    ).toBe('Package: Starter Pack');
  });
});

describe('collectCouponPurchaseIds', () => {
  it('reads the package, class, and bar from a cart payment', () => {
    expect(
      collectCouponPurchaseIds([
        {
          source: 'OTHER',
          sourceId: null,
          metadata: {
            checkoutKind: 'CART',
            packagePlanId: 'plan-1',
            sessionId: 'session-1',
            barProductId: 'bar-1',
            classSessionsCovered: 0,
          },
        },
      ]),
    ).toEqual({
      userPackageIds: [],
      sessionIds: ['session-1'],
      planIds: ['plan-1'],
      barProductIds: ['bar-1'],
    });
  });
});

describe('sessionDisplayName', () => {
  it('uses the class type when the session title is blank', () => {
    expect(sessionDisplayName({ title: '  ', classTypeName: 'Reformer' })).toBe(
      'Reformer',
    );
  });
});
