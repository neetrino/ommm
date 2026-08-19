import {
  BookingChannel,
  BookingStatus,
  PaymentSource,
  PaymentStatus,
  Role,
  WaitlistStatus,
} from '@prisma/client';
import { aggregateStudioRange } from './studio-analytics.aggregate';
import {
  emptyGiftCredits,
  emptyMemberCounts,
} from './studio-analytics.helpers';
import type {
  StudioAnalyticsLoadedRange,
  StudioAnalyticsPaymentRow,
} from './studio-analytics.types';

const FROM = new Date(2026, 5, 1, 0, 0, 0);
const TO = new Date(2026, 5, 3, 23, 59, 59);

function payment(
  overrides: Partial<StudioAnalyticsPaymentRow> = {},
): StudioAnalyticsPaymentRow {
  return {
    amountCents: 12_000,
    description: 'Membership',
    status: PaymentStatus.SUCCEEDED,
    createdAt: FROM,
    source: PaymentSource.PACKAGE,
    sourceId: 'pkg-1',
    paymentMethod: 'CARD',
    userId: 'user-1',
    userRole: Role.USER,
    userLabel: 'Client One',
    ...overrides,
  };
}

function loaded(
  overrides: Partial<StudioAnalyticsLoadedRange> = {},
): StudioAnalyticsLoadedRange {
  return {
    from: FROM,
    to: TO,
    sessions: [
      {
        id: 's1',
        startsAt: new Date(2026, 5, 2, 18, 30, 0),
        capacity: 10,
        coachId: 'coach-1',
        classTypeId: 'type-1',
        priceCents: 0,
      },
    ],
    bookingGroups: [
      {
        sessionId: 's1',
        status: BookingStatus.COMPLETED,
        channel: BookingChannel.WEBSITE,
        count: 2,
      },
    ],
    waitlistGroups: [{ sessionId: 's1', status: WaitlistStatus.ACTIVE, count: 0 }],
    payments: [payment()],
    packagePlans: [
      {
        userPackageId: 'pkg-1',
        planId: 'plan-vinyasa',
        planName: 'Vinyasa 8',
        categoryName: 'Vinyasa',
        classTypeId: 'type-1',
        typeSessionAllocations: [],
      },
    ],
    consumptions: [
      {
        restoredAt: null,
        consumedSessions: 1,
        sessionId: 's1',
        coachId: 'coach-1',
        classTypeId: 'type-1',
        sessionPriceCents: 0,
        planPriceCentsSnapshot: 12_000,
        sessionsTotal: 4,
      },
    ],
    coaches: [{ id: 'coach-1', label: 'Anna Lee', isActive: true }],
    classTypes: [{ id: 'type-1', label: 'Vinyasa' }],
    filters: {},
    members: emptyMemberCounts(),
    giftCredits: emptyGiftCredits(),
    ...overrides,
  };
}

describe('studio analytics package sales attribution', () => {
  it('uses package cash for class types and does not add consumption on top', () => {
    const result = aggregateStudioRange(loaded());

    expect(result.revenue.byClassType[0]).toMatchObject({
      id: 'type-1',
      amountCents: 12_000,
      bookings: 2,
    });
    expect(result.revenue.byPackage[0]).toMatchObject({
      id: 'plan-vinyasa',
      label: 'Vinyasa 8',
      count: 1,
      amountCents: 12_000,
    });
    expect(result.revenue.topClients[0]).toMatchObject({
      id: 'user-1',
      amountCents: 12_000,
      paymentsCount: 1,
    });
    expect(result.coaches.rows[0]?.revenueCents).toBe(3_000);
  });

  it('skips zero-value consumption for visit attribution', () => {
    const result = aggregateStudioRange(
      loaded({
        payments: [],
        packagePlans: [],
        consumptions: [
          {
            restoredAt: null,
            consumedSessions: 1,
            sessionId: 's1',
            coachId: 'coach-1',
            classTypeId: 'type-1',
            sessionPriceCents: 0,
            planPriceCentsSnapshot: 0,
            sessionsTotal: null,
          },
        ],
      }),
    );

    expect(result.revenue.byClassType[0]?.amountCents).toBe(0);
    expect(result.coaches.rows[0]?.revenueCents).toBe(0);
  });
});
