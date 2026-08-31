import {
  resolveActivatedPeriodBounds,
  resolveActivationInstant,
  shouldAwaitFirstVisit,
} from './packages-activation.helpers';
import { resolveActivationGraceDeadline } from './packages-activation.time';
import {
  PACKAGE_PERIOD_DAY_MS,
  startOfUtcDay,
} from './user-package-period.util';

describe('packages-activation.helpers', () => {
  const purchasedAt = new Date('2026-08-26T14:30:00.000Z');

  it('awaits first visit when plan has no start date', () => {
    expect(shouldAwaitFirstVisit(null, purchasedAt)).toBe(true);
  });

  it('does not await when plan start date is in the future', () => {
    expect(
      shouldAwaitFirstVisit(new Date('2026-09-10T00:00:00.000Z'), purchasedAt),
    ).toBe(false);
  });

  it('awaits when plan start date is on or before purchase day', () => {
    expect(
      shouldAwaitFirstVisit(new Date('2026-08-26T00:00:00.000Z'), purchasedAt),
    ).toBe(true);
  });

  it('starts the period on the visit day', () => {
    const { currentPeriodStart, currentPeriodEnd } =
      resolveActivatedPeriodBounds({
        activationAt: new Date('2026-09-02T18:00:00.000Z'),
        periodDays: 30,
      });
    expect(currentPeriodStart).toEqual(
      startOfUtcDay(new Date('2026-09-02T18:00:00.000Z')),
    );
    expect(currentPeriodEnd.getTime() - currentPeriodStart.getTime()).toBe(
      30 * PACKAGE_PERIOD_DAY_MS,
    );
  });

  it('uses the first visit when it is inside the grace window', () => {
    const visitAt = new Date('2026-09-10T09:00:00.000Z');
    expect(
      resolveActivationInstant({
        purchasedAt,
        firstVisitAt: visitAt,
        now: new Date('2026-09-10T10:00:00.000Z'),
      }),
    ).toEqual(visitAt);
  });

  it('uses the grace deadline when there is no visit after 30 days', () => {
    const now = new Date('2026-09-26T00:00:00.000Z');
    expect(
      resolveActivationInstant({
        purchasedAt,
        firstVisitAt: null,
        now,
      }),
    ).toEqual(resolveActivationGraceDeadline(purchasedAt));
  });

  it('caps a late first visit at the grace deadline', () => {
    expect(
      resolveActivationInstant({
        purchasedAt,
        firstVisitAt: new Date('2026-10-05T09:00:00.000Z'),
        now: new Date('2026-10-05T10:00:00.000Z'),
      }),
    ).toEqual(resolveActivationGraceDeadline(purchasedAt));
  });

  it('stays waiting when there is no visit and grace has not elapsed', () => {
    expect(
      resolveActivationInstant({
        purchasedAt,
        firstVisitAt: null,
        now: new Date('2026-09-10T10:00:00.000Z'),
      }),
    ).toBeNull();
  });

  it('ignores a completed visit that happened before the purchase', () => {
    expect(
      resolveActivationInstant({
        purchasedAt,
        firstVisitAt: new Date('2026-07-01T09:00:00.000Z'),
        now: new Date('2026-08-27T10:00:00.000Z'),
      }),
    ).toBeNull();
  });
});
