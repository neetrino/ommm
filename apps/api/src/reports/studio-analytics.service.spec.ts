import {
  BookingChannel,
  BookingStatus,
  PaymentSource,
  PaymentStatus,
  Role,
} from '@prisma/client';
import {
  emptyGiftCredits,
  emptyMemberCounts,
} from './studio-analytics.helpers';
import { StudioAnalyticsService } from './studio-analytics.service';
import type { StudioAnalyticsLoadedRange } from './studio-analytics.types';

function loadedRange(
  from: Date,
  to: Date,
  revenueCents: number,
  newMembers: number,
): StudioAnalyticsLoadedRange {
  return {
    from,
    to,
    sessions: [],
    bookingGroups: [],
    waitlistGroups: [],
    payments: [
      {
        amountCents: revenueCents,
        description: 'Membership',
        status: PaymentStatus.SUCCEEDED,
        createdAt: from,
        source: PaymentSource.PACKAGE,
        sourceId: 'pkg-1',
        paymentMethod: 'CARD',
        userId: 'user-1',
        userRole: Role.USER,
        userLabel: 'Client One',
      },
    ],
    packagePlans: [],
    consumptions: [],
    coaches: [],
    classTypes: [],
    filters: {},
    members: { ...emptyMemberCounts(), newInRange: newMembers },
    giftCredits: emptyGiftCredits(),
  };
}

describe('StudioAnalyticsService', () => {
  it('compares current and previous period KPI slices', async () => {
    const loadRange = jest.fn();
    const service = new StudioAnalyticsService({ loadRange } as never);
    const from = '2026-02-01T00:00:00.000Z';
    const to = '2026-03-03T00:00:00.000Z';
    loadRange
      .mockResolvedValueOnce(
        loadedRange(new Date(from), new Date(to), 12_000, 4),
      )
      .mockResolvedValueOnce(
        loadedRange(
          new Date('2026-01-01T00:00:00.000Z'),
          new Date('2026-01-31T23:59:59.999Z'),
          8_000,
          2,
        ),
      );

    const result = await service.studioAnalytics({ from, to });

    expect(result.range.from).toBe(from);
    expect(result.range.to).toBe(to);
    expect(result.range.previousTo).toBe('2026-01-31T23:59:59.999Z');
    expect(result.comparison.revenueCents).toEqual({
      current: 12_000,
      previous: 8_000,
      trendPercent: 50,
    });
    expect(result.comparison.newMembers).toEqual({
      current: 4,
      previous: 2,
      trendPercent: 100,
    });
    expect(result.kpis.revenueCents).toBe(12_000);
    expect(loadRange).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        mode: 'full',
        previous: {
          from: new Date(result.range.previousFrom),
          to: new Date(result.range.previousTo),
        },
      }),
    );
    expect(loadRange).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ mode: 'comparison' }),
    );
  });

  it('does not treat empty booking groups as traffic', async () => {
    const from = new Date('2026-06-01T00:00:00.000Z');
    const to = new Date('2026-06-02T00:00:00.000Z');
    const loadRange = jest.fn().mockResolvedValue({
      from,
      to,
      sessions: [],
      bookingGroups: [
        {
          sessionId: 's1',
          status: BookingStatus.COMPLETED,
          channel: BookingChannel.WEBSITE,
          count: 0,
        },
      ],
      waitlistGroups: [],
      payments: [],
      packagePlans: [],
      consumptions: [],
      coaches: [],
      classTypes: [],
      filters: {},
      members: emptyMemberCounts(),
      giftCredits: emptyGiftCredits(),
    });
    const service = new StudioAnalyticsService({ loadRange } as never);

    const result = await service.studioAnalytics({
      from: from.toISOString(),
      to: to.toISOString(),
    });

    expect(result.kpis.bookingsTotal).toBe(0);
    expect(result.comparison.bookings.trendPercent).toBeNull();
  });
});
