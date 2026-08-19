import {
  classifyMemberActivity,
  consumptionAttributedCents,
  eachLocalDateKey,
  isAttributableConsumption,
  ratePercent,
  resolvePreviousPeriod,
  trendPercent,
} from './studio-analytics.helpers';

describe('studio-analytics.helpers', () => {
  it('ratePercent rounds occupancy, attendance and cancellation', () => {
    expect(ratePercent(3, 10)).toBe(30);
    expect(ratePercent(1, 2)).toBe(50);
    expect(ratePercent(2, 3)).toBe(67);
    expect(ratePercent(0, 8)).toBe(0);
  });

  it('ratePercent is null when the denominator is 0', () => {
    expect(ratePercent(4, 0)).toBeNull();
    expect(ratePercent(0, 0)).toBeNull();
  });

  it('trendPercent is null when previous is 0', () => {
    expect(trendPercent(120, 100)).toBe(20);
    expect(trendPercent(80, 100)).toBe(-20);
    expect(trendPercent(10, 0)).toBeNull();
  });

  it('resolvePreviousPeriod uses the same duration immediately before from', () => {
    const from = new Date('2026-02-01T00:00:00.000Z');
    const to = new Date('2026-03-03T00:00:00.000Z');
    const previous = resolvePreviousPeriod(from, to);
    const durationMs = to.getTime() - from.getTime();

    expect(previous.previousTo.getTime()).toBe(from.getTime() - 1);
    expect(previous.previousFrom.getTime()).toBe(
      previous.previousTo.getTime() - durationMs,
    );
  });

  it('eachLocalDateKey fills every local day inclusively', () => {
    const keys = eachLocalDateKey(
      new Date(2026, 5, 1, 15, 0, 0),
      new Date(2026, 5, 3, 8, 0, 0),
    );
    expect(keys[0]).toBe('2026-06-01');
    expect(keys[keys.length - 1]).toBe('2026-06-03');
    expect(keys).toHaveLength(3);
  });

  it('consumptionAttributedCents splits package price and skips unlimited fallback', () => {
    expect(
      consumptionAttributedCents({
        planPriceCentsSnapshot: 10_000,
        sessionsTotal: 4,
        sessionPriceCents: 3_000,
        consumedSessions: 2,
      }),
    ).toBe(5_000);
    expect(
      consumptionAttributedCents({
        planPriceCentsSnapshot: 10_000,
        sessionsTotal: null,
        sessionPriceCents: 3_000,
        consumedSessions: 2,
      }),
    ).toBe(6_000);
  });

  it('isAttributableConsumption skips restored rows', () => {
    expect(isAttributableConsumption(null)).toBe(true);
    expect(
      isAttributableConsumption(new Date('2026-06-02T00:00:00.000Z')),
    ).toBe(false);
  });

  it('classifyMemberActivity separates new, returning and first-visit users', () => {
    const rangeFrom = new Date('2026-06-01T00:00:00.000Z');
    const rangeTo = new Date('2026-06-30T23:59:59.000Z');
    const newMember = classifyMemberActivity({
      createdAt: new Date('2026-06-10T00:00:00.000Z'),
      firstCompletedAt: new Date('2026-06-12T00:00:00.000Z'),
      rangeFrom,
      rangeTo,
      hasCompletedInRange: true,
      hasCompletedBeforeRange: false,
    });
    const returning = classifyMemberActivity({
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      firstCompletedAt: new Date('2026-01-15T00:00:00.000Z'),
      rangeFrom,
      rangeTo,
      hasCompletedInRange: true,
      hasCompletedBeforeRange: true,
    });

    expect(newMember).toEqual({
      isNewMember: true,
      isReturning: false,
      isFirstVisit: true,
    });
    expect(returning).toEqual({
      isNewMember: false,
      isReturning: true,
      isFirstVisit: false,
    });
  });
});
