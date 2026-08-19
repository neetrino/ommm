import { PaymentStatus } from '@prisma/client';
import {
  buildDailySeries,
  buildOperations,
  emptySessionStats,
  indexBookingGroups,
  summarizeWaitlist,
  type BookingIndex,
  type WaitlistSummary,
} from './studio-analytics.bookings';
import { emptyGiftCredits, ratePercent } from './studio-analytics.helpers';
import {
  attributeSessionRevenue,
  buildAttributedBreakdown,
  summarizeCashRevenue,
} from './studio-analytics.revenue';
import type {
  StudioAnalyticsLabelRow,
  StudioAnalyticsLoadedRange,
  StudioAnalyticsPayload,
  StudioAnalyticsSessionRow,
} from './studio-analytics.types';

export type StudioAnalyticsComparisonSlice = {
  revenueCents: number;
  bookings: number;
  attendanceRate: number;
  occupancyRate: number;
  newMembers: number;
};

export type StudioAnalyticsRangeResult = {
  kpis: StudioAnalyticsPayload['kpis'];
  daily: StudioAnalyticsPayload['daily'];
  revenue: StudioAnalyticsPayload['revenue'];
  operations: StudioAnalyticsPayload['operations'];
  members: StudioAnalyticsPayload['members'];
  coaches: StudioAnalyticsPayload['coaches'];
  comparisonSlice: StudioAnalyticsComparisonSlice;
};

export { attributeSessionRevenue } from './studio-analytics.revenue';
export {
  indexBookingGroups,
  summarizeWaitlist,
} from './studio-analytics.bookings';

export function aggregateStudioRange(
  input: StudioAnalyticsLoadedRange,
): StudioAnalyticsRangeResult {
  const bookings = indexBookingGroups(input.bookingGroups);
  const waitlist = summarizeWaitlist(input.waitlistGroups);
  const revenueBySession = attributeSessionRevenue(input);
  const cash = summarizeCashRevenue(input.payments);
  const attributed = buildAttributedBreakdown(
    input,
    bookings,
    revenueBySession,
  );
  const kpis = buildKpis(input, bookings.totals, waitlist);
  return {
    kpis,
    daily: buildDailySeries(input, bookings.bySession),
    revenue: {
      ...cash,
      byClassType: attributed.byClassType,
      byCoach: attributed.byCoach,
      giftCredits: input.giftCredits ?? emptyGiftCredits(),
    },
    operations: buildOperations(input, bookings, waitlist),
    members: buildMembers(input),
    coaches: buildCoachRows(input, bookings, waitlist, revenueBySession),
    comparisonSlice: {
      revenueCents: kpis.revenueCents,
      bookings: kpis.bookingsTotal,
      attendanceRate: kpis.attendanceRate ?? 0,
      occupancyRate: kpis.occupancyRate ?? 0,
      newMembers: kpis.newMembers,
    },
  };
}

function buildKpis(
  input: StudioAnalyticsLoadedRange,
  totals: BookingIndex['totals'],
  waitlist: WaitlistSummary,
): StudioAnalyticsPayload['kpis'] {
  const succeeded = input.payments.filter(
    (payment) => payment.status === PaymentStatus.SUCCEEDED,
  );
  const revenueCents = succeeded.reduce(
    (sum, payment) => sum + payment.amountCents,
    0,
  );
  const capacity = input.sessions.reduce(
    (sum, session) => sum + session.capacity,
    0,
  );
  const attendedDenom = totals.completed + totals.missed;
  return {
    revenueCents,
    successfulPaymentsCount: succeeded.length,
    averageOrderValueCents:
      succeeded.length > 0 ? Math.round(revenueCents / succeeded.length) : 0,
    bookingsTotal: totals.total,
    attendanceRate: ratePercent(totals.completed, attendedDenom),
    occupancyRate: ratePercent(totals.occupied, capacity),
    cancellationRate: ratePercent(totals.cancelled, totals.total),
    noShowRate: ratePercent(totals.missed, attendedDenom),
    activeMembers: input.members.active,
    newMembers: input.members.newInRange,
    waitlistActive: waitlist.active,
    waitlistConversionRate: waitlist.conversionRate,
  };
}

function buildMembers(
  input: StudioAnalyticsLoadedRange,
): StudioAnalyticsPayload['members'] {
  const { members } = input;
  return {
    total: members.total,
    active: members.active,
    vip: members.vip,
    newInRange: members.newInRange,
    returningInRange: members.returningInRange,
    inactive30d: members.inactive30d,
    retentionRate: ratePercent(
      members.retentionReturned,
      members.retentionCohortSize,
    ),
    firstVisitsInRange: members.firstVisitsInRange,
    totalVisitsInRange: members.totalVisitsInRange,
    lifetimeValueCents: members.lifetimeValueCents,
    packages: members.packages,
  };
}

function buildCoachRows(
  input: StudioAnalyticsLoadedRange,
  bookings: BookingIndex,
  waitlist: WaitlistSummary,
  revenueBySession: Map<string, number>,
): StudioAnalyticsPayload['coaches'] {
  const rows = new Map<string, CoachRowAccumulator>();
  for (const session of input.sessions) {
    addCoachSessionRow(
      rows,
      input.coaches,
      session,
      bookings,
      waitlist,
      revenueBySession,
    );
  }
  return {
    rows: [...rows.values()]
      .map(toCoachRow)
      .sort((left, right) => right.revenueCents - left.revenueCents),
  };
}

type CoachRowAccumulator = StudioAnalyticsPayload['coaches']['rows'][number] & {
  occupiedSeats: number;
  capacity: number;
};

function addCoachSessionRow(
  rows: Map<string, CoachRowAccumulator>,
  labels: StudioAnalyticsLabelRow[],
  session: StudioAnalyticsSessionRow,
  bookings: BookingIndex,
  waitlist: WaitlistSummary,
  revenueBySession: Map<string, number>,
): void {
  const stats = bookings.bySession.get(session.id) ?? emptySessionStats();
  const row =
    rows.get(session.coachId) ?? emptyCoachAccumulator(session.coachId, labels);
  row.sessions += 1;
  row.bookings += stats.total;
  row.completed += stats.completed;
  row.missed += stats.missed;
  row.occupiedSeats += stats.occupied;
  row.capacity += session.capacity;
  row.revenueCents += revenueBySession.get(session.id) ?? 0;
  row.waitlistActive += waitlist.bySessionActive.get(session.id) ?? 0;
  row.occupancyRate = ratePercent(row.occupiedSeats, row.capacity);
  row.attendanceRate = ratePercent(row.completed, row.completed + row.missed);
  rows.set(session.coachId, row);
}

function emptyCoachAccumulator(
  id: string,
  labels: StudioAnalyticsLabelRow[],
): CoachRowAccumulator {
  const label = labels.find((item) => item.id === id);
  return {
    id,
    name: label?.label ?? id,
    isActive: label?.isActive ?? false,
    sessions: 0,
    bookings: 0,
    completed: 0,
    missed: 0,
    occupancyRate: null,
    attendanceRate: null,
    revenueCents: 0,
    waitlistActive: 0,
    occupiedSeats: 0,
    capacity: 0,
  };
}

function toCoachRow(
  row: CoachRowAccumulator,
): StudioAnalyticsPayload['coaches']['rows'][number] {
  return {
    id: row.id,
    name: row.name,
    isActive: row.isActive,
    sessions: row.sessions,
    bookings: row.bookings,
    completed: row.completed,
    missed: row.missed,
    occupancyRate: row.occupancyRate,
    attendanceRate: row.attendanceRate,
    revenueCents: row.revenueCents,
    waitlistActive: row.waitlistActive,
  };
}
