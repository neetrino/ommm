import {
  PACKAGE_PERIOD_DAY_MS,
  resolveUserPackagePeriodBounds,
  resolveUserPackagePeriodStart,
  startOfUtcDay,
} from './user-package-period.util';

describe('user-package-period.util', () => {
  it('uses purchase time when plan start date is unset', () => {
    const purchasedAt = new Date('2026-07-09T14:30:00.000Z');
    expect(resolveUserPackagePeriodStart(null, purchasedAt)).toEqual(purchasedAt);
  });

  it('defers activation to a future plan start date', () => {
    const purchasedAt = new Date('2026-07-09T14:30:00.000Z');
    const planStartDate = new Date('2026-07-19T00:00:00.000Z');
    expect(resolveUserPackagePeriodStart(planStartDate, purchasedAt)).toEqual(
      startOfUtcDay(planStartDate),
    );
  });

  it('keeps purchase time when plan start date is in the past', () => {
    const purchasedAt = new Date('2026-07-09T14:30:00.000Z');
    const planStartDate = new Date('2026-07-05T00:00:00.000Z');
    expect(resolveUserPackagePeriodStart(planStartDate, purchasedAt)).toEqual(
      purchasedAt,
    );
  });

  it('counts duration from deferred start date', () => {
    const purchasedAt = new Date('2026-07-09T14:30:00.000Z');
    const planStartDate = new Date('2026-07-19T00:00:00.000Z');
    const { currentPeriodStart, currentPeriodEnd } = resolveUserPackagePeriodBounds({
      planStartDate,
      purchasedAt,
      periodDays: 30,
    });
    expect(currentPeriodStart).toEqual(startOfUtcDay(planStartDate));
    expect(currentPeriodEnd.getTime() - currentPeriodStart.getTime()).toBe(
      30 * PACKAGE_PERIOD_DAY_MS,
    );
  });
});
