import { deriveCouponDisplayStatus, remainingCouponUses } from './coupon-status.util';

const now = new Date('2026-10-16T08:00:00.000Z');

describe('deriveCouponDisplayStatus', () => {
  it('keeps a draft as draft', () => {
    expect(
      deriveCouponDisplayStatus({
        status: 'DRAFT',
        validUntil: new Date('2020-01-01T00:00:00.000Z'),
        totalUsageLimit: 1,
        usedCount: 1,
        now,
      }),
    ).toBe('DRAFT');
  });

  it('reports expired and usage-limit before a plain active state', () => {
    expect(
      deriveCouponDisplayStatus({
        status: 'ACTIVE',
        validUntil: new Date('2026-10-01T00:00:00.000Z'),
        totalUsageLimit: 10,
        usedCount: 1,
        now,
      }),
    ).toBe('EXPIRED');
    expect(
      deriveCouponDisplayStatus({
        status: 'ACTIVE',
        validUntil: null,
        totalUsageLimit: 2,
        usedCount: 2,
        now,
      }),
    ).toBe('USAGE_LIMIT_REACHED');
  });

  it('counts remaining uses from the limit', () => {
    expect(remainingCouponUses(5, 2)).toBe(3);
    expect(remainingCouponUses(null, 4)).toBeNull();
  });
});
