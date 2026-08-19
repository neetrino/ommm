import {
  BookingChannel,
  BookingStatus,
  PaymentSource,
  PaymentStatus,
  Role,
  WaitlistStatus,
} from '@prisma/client';
import {
  aggregateStudioRange,
  attributeSessionRevenue,
} from './studio-analytics.aggregate';
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
const SESSION_START = new Date(2026, 5, 2, 18, 30, 0);

function loaded(
  overrides: Partial<StudioAnalyticsLoadedRange> = {},
): StudioAnalyticsLoadedRange {
  return {
    from: FROM,
    to: TO,
    sessions: [
      {
        id: 's1',
        startsAt: SESSION_START,
        capacity: 10,
        coachId: 'coach-1',
        classTypeId: 'type-1',
        priceCents: 4_000,
      },
    ],
    bookingGroups: defaultBookingGroups(),
    waitlistGroups: defaultWaitlistGroups(),
    payments: [],
    packagePlans: [],
    consumptions: [],
    coaches: [{ id: 'coach-1', label: 'Anna Lee', isActive: true }],
    classTypes: [{ id: 'type-1', label: 'Vinyasa' }],
    filters: {},
    members: defaultMembers(),
    giftCredits: emptyGiftCredits(),
    ...overrides,
  };
}

function payment(
  overrides: Partial<StudioAnalyticsPaymentRow> = {},
): StudioAnalyticsPaymentRow {
  return {
    amountCents: 8_000,
    description: 'Membership',
    status: PaymentStatus.SUCCEEDED,
    createdAt: new Date(2026, 5, 1, 9, 0, 0),
    source: PaymentSource.PACKAGE,
    sourceId: 'pkg-1',
    paymentMethod: 'CARD',
    userId: 'user-1',
    userRole: Role.USER,
    userLabel: 'Client One',
    ...overrides,
  };
}

function defaultBookingGroups(): StudioAnalyticsLoadedRange['bookingGroups'] {
  return [
    {
      sessionId: 's1',
      status: BookingStatus.COMPLETED,
      channel: BookingChannel.WEBSITE,
      count: 2,
    },
    {
      sessionId: 's1',
      status: BookingStatus.MISSED,
      channel: BookingChannel.APP,
      count: 1,
    },
    {
      sessionId: 's1',
      status: BookingStatus.CANCELLED,
      channel: BookingChannel.WEBSITE,
      count: 1,
    },
  ];
}

function defaultWaitlistGroups(): StudioAnalyticsLoadedRange['waitlistGroups'] {
  return [
    { sessionId: 's1', status: WaitlistStatus.ACTIVE, count: 2 },
    { sessionId: 's1', status: WaitlistStatus.CONVERTED, count: 1 },
    { sessionId: 's1', status: WaitlistStatus.EXPIRED, count: 1 },
  ];
}

function defaultMembers(): StudioAnalyticsLoadedRange['members'] {
  return {
    ...emptyMemberCounts(),
    total: 20,
    active: 8,
    newInRange: 3,
    returningInRange: 5,
    firstVisitsInRange: 2,
    totalVisitsInRange: 7,
    retentionCohortSize: 10,
    retentionReturned: 4,
  };
}

describe('studio-analytics.aggregate', () => {
  it('attributes drop-in cash to the matching in-scope session', () => {
    const bySession = attributeSessionRevenue({
      sessions: loaded().sessions,
      payments: [
        payment({
          amountCents: 7_000,
          description: 'Drop-in session s1',
          source: PaymentSource.DROPIN,
          sourceId: 's1',
          paymentMethod: 'CASH',
          createdAt: new Date('2026-06-02T10:00:00.000Z'),
        }),
        payment({
          amountCents: 5_000,
          description: 'Drop-in missing session',
          source: PaymentSource.DROPIN,
          sourceId: 'missing',
          paymentMethod: 'CASH',
          createdAt: new Date('2026-06-02T11:00:00.000Z'),
        }),
      ],
      consumptions: [],
    });

    expect(bySession.get('s1')).toBe(7_000);
    expect(bySession.has('missing')).toBe(false);
  });

  it('splits package consumption and skips restored rows', () => {
    const bySession = attributeSessionRevenue({
      sessions: loaded().sessions,
      payments: [],
      consumptions: [
        {
          restoredAt: null,
          consumedSessions: 2,
          sessionId: 's1',
          coachId: 'coach-1',
          classTypeId: 'type-1',
          sessionPriceCents: 4_000,
          planPriceCentsSnapshot: 12_000,
          sessionsTotal: 4,
        },
        {
          restoredAt: new Date('2026-06-02T12:00:00.000Z'),
          consumedSessions: 1,
          sessionId: 's1',
          coachId: 'coach-1',
          classTypeId: 'type-1',
          sessionPriceCents: 4_000,
          planPriceCentsSnapshot: 12_000,
          sessionsTotal: 4,
        },
      ],
    });

    expect(bySession.get('s1')).toBe(6_000);
  });

  it('fills daily buckets and keeps cash revenue on the payment day', () => {
    const result = aggregateStudioRange(
      loaded({
        payments: [payment()],
      }),
    );

    expect(result.daily.map((day) => day.dateKey)).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
    ]);
    expect(result.daily[0]).toMatchObject({
      dateKey: '2026-06-01',
      revenueCents: 8_000,
      bookings: 0,
      capacity: 0,
      occupancyRate: null,
    });
    expect(result.daily[1]).toMatchObject({
      dateKey: '2026-06-02',
      bookings: 4,
      completed: 2,
      cancelled: 1,
      missed: 1,
      occupiedSeats: 3,
      capacity: 10,
      occupancyRate: 30,
      revenueCents: 0,
    });
    expect(result.daily[2]?.bookings).toBe(0);
  });

  it('computes rates, waitlist conversion, retention and coach revenue', () => {
    const result = aggregateStudioRange(
      loaded({
        payments: [
          payment({
            amountCents: 7_000,
            description: 'Drop-in session s1',
            source: PaymentSource.DROPIN,
            sourceId: 's1',
            paymentMethod: null,
            createdAt: new Date('2026-06-02T10:00:00.000Z'),
          }),
        ],
      }),
    );

    expect(result.kpis.attendanceRate).toBe(67);
    expect(result.kpis.occupancyRate).toBe(30);
    expect(result.kpis.cancellationRate).toBe(25);
    expect(result.kpis.noShowRate).toBe(33);
    expect(result.kpis.waitlistActive).toBe(2);
    expect(result.kpis.waitlistConversionRate).toBe(25);
    expect(result.members.retentionRate).toBe(40);
    expect(result.members.newInRange).toBe(3);
    expect(result.members.returningInRange).toBe(5);
    expect(result.operations.channels).toEqual({ WEBSITE: 3, APP: 1 });
    expect(result.revenue.byPaymentMethod[0]).toMatchObject({
      method: 'UNKNOWN',
      count: 1,
      amountCents: 7_000,
    });
    expect(result.revenue.byClassType[0]).toMatchObject({
      id: 'type-1',
      label: 'Vinyasa',
      amountCents: 7_000,
      bookings: 4,
    });
    expect(result.revenue.byCoach[0]).toMatchObject({
      id: 'coach-1',
      amountCents: 7_000,
      bookings: 4,
      sessions: 1,
    });
    expect(result.coaches.rows[0]).toMatchObject({
      name: 'Anna Lee',
      revenueCents: 7_000,
      waitlistActive: 2,
      occupancyRate: 30,
      attendanceRate: 67,
    });
    expect(result.coaches.rows[0]).not.toHaveProperty('occupiedSeats');
  });
});
