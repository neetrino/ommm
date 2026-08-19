import { PaymentSource, PaymentStatus } from '@prisma/client';
import { isInfluencerPaymentMethod } from '../payments/payment-revenue.util';
import { aggregatePaymentsBySource } from './reports-export.helpers';
import type { BookingIndex } from './studio-analytics.bookings';
import { emptySessionStats } from './studio-analytics.bookings';
import {
  consumptionAttributedCents,
  isAttributableConsumption,
  UNKNOWN_PAYMENT_METHOD,
} from './studio-analytics.helpers';
import { applyPackageSalesToClassTypes } from './studio-analytics.rankings';
import type {
  StudioAnalyticsConsumptionRow,
  StudioAnalyticsLabelRow,
  StudioAnalyticsLoadedRange,
  StudioAnalyticsPayload,
  StudioAnalyticsPaymentRow,
  StudioAnalyticsSessionRow,
} from './studio-analytics.types';

export function attributeSessionRevenue(params: {
  sessions: StudioAnalyticsSessionRow[];
  payments: StudioAnalyticsPaymentRow[];
  consumptions: StudioAnalyticsConsumptionRow[];
}): Map<string, number> {
  const bySession = attributeDropinSessionRevenue(params);
  for (const row of params.consumptions) {
    addConsumptionRevenue(bySession, row);
  }
  return bySession;
}

function addConsumptionRevenue(
  bySession: Map<string, number>,
  row: StudioAnalyticsConsumptionRow,
): void {
  if (row.isInfluencerComp || !isAttributableConsumption(row.restoredAt)) {
    return;
  }
  const cents = consumptionAttributedCents({
    planPriceCentsSnapshot: row.planPriceCentsSnapshot,
    sessionsTotal: row.sessionsTotal,
    sessionPriceCents: row.sessionPriceCents,
    consumedSessions: row.consumedSessions,
  });
  if (cents <= 0) {
    return;
  }
  bySession.set(row.sessionId, (bySession.get(row.sessionId) ?? 0) + cents);
}

function isAttributableDropin(
  payment: StudioAnalyticsPaymentRow,
  sessionIds: Set<string>,
): boolean {
  return (
    payment.status === PaymentStatus.SUCCEEDED &&
    payment.source === PaymentSource.DROPIN &&
    payment.sourceId !== null &&
    sessionIds.has(payment.sourceId)
  );
}

export function summarizeCashRevenue(
  payments: StudioAnalyticsPaymentRow[],
): Pick<
  StudioAnalyticsPayload['revenue'],
  'bySource' | 'byStatus' | 'byPaymentMethod'
> {
  const byStatusMap = new Map<string, { count: number; amountCents: number }>();
  const byMethodMap = new Map<string, { count: number; amountCents: number }>();
  for (const payment of payments) {
    if (isInfluencerPaymentMethod(payment.paymentMethod)) {
      continue;
    }
    addCashBucket(byStatusMap, payment.status, payment);
    addCashBucket(
      byMethodMap,
      payment.paymentMethod ?? UNKNOWN_PAYMENT_METHOD,
      payment,
    );
  }
  return {
    bySource: aggregatePaymentsBySource(
      payments.filter(
        (payment) => !isInfluencerPaymentMethod(payment.paymentMethod),
      ),
    ),
    byStatus: [...byStatusMap.entries()].map(([status, value]) => ({
      status,
      ...value,
    })),
    byPaymentMethod: [...byMethodMap.entries()].map(([method, value]) => ({
      method,
      ...value,
    })),
  };
}

function addCashBucket(
  map: Map<string, { count: number; amountCents: number }>,
  key: string,
  payment: StudioAnalyticsPaymentRow,
): void {
  const entry = map.get(key) ?? { count: 0, amountCents: 0 };
  entry.count += 1;
  entry.amountCents += payment.amountCents;
  map.set(key, entry);
}

export function attributeDropinSessionRevenue(params: {
  sessions: StudioAnalyticsSessionRow[];
  payments: StudioAnalyticsPaymentRow[];
}): Map<string, number> {
  const sessionIds = new Set(params.sessions.map((session) => session.id));
  const bySession = new Map<string, number>();
  for (const payment of params.payments) {
    if (!isAttributableDropin(payment, sessionIds) || !payment.sourceId) {
      continue;
    }
    bySession.set(
      payment.sourceId,
      (bySession.get(payment.sourceId) ?? 0) + payment.amountCents,
    );
  }
  return bySession;
}

export function buildAttributedBreakdown(
  input: StudioAnalyticsLoadedRange,
  bookings: BookingIndex,
  visitRevenueBySession: Map<string, number>,
  dropinRevenueBySession: Map<string, number>,
): Pick<StudioAnalyticsPayload['revenue'], 'byClassType' | 'byCoach'> {
  const classTypes = new Map<
    string,
    { id: string; label: string; amountCents: number; bookings: number }
  >();
  const coaches = new Map<
    string,
    {
      id: string;
      label: string;
      amountCents: number;
      bookings: number;
      sessions: number;
    }
  >();
  for (const session of input.sessions) {
    const stats = bookings.bySession.get(session.id) ?? emptySessionStats();
    addClassTypeBucket(
      classTypes,
      input.classTypes,
      session,
      stats.total,
      dropinRevenueBySession.get(session.id) ?? 0,
    );
    addCoachBucket(
      coaches,
      input.coaches,
      session,
      stats.total,
      visitRevenueBySession.get(session.id) ?? 0,
    );
  }
  applyPackageSalesToClassTypes(
    classTypes,
    input.payments,
    input.packagePlans,
    input.classTypes,
    input.filters.classTypeId,
  );
  return {
    byClassType: [...classTypes.values()].sort(
      (left, right) => right.amountCents - left.amountCents,
    ),
    byCoach: [...coaches.values()].sort(
      (left, right) => right.amountCents - left.amountCents,
    ),
  };
}

function addClassTypeBucket(
  map: Map<
    string,
    { id: string; label: string; amountCents: number; bookings: number }
  >,
  labels: StudioAnalyticsLabelRow[],
  session: StudioAnalyticsSessionRow,
  bookings: number,
  amountCents: number,
): void {
  const entry = map.get(session.classTypeId) ?? {
    id: session.classTypeId,
    label: findLabel(labels, session.classTypeId),
    amountCents: 0,
    bookings: 0,
  };
  entry.amountCents += amountCents;
  entry.bookings += bookings;
  map.set(session.classTypeId, entry);
}

function addCoachBucket(
  map: Map<
    string,
    {
      id: string;
      label: string;
      amountCents: number;
      bookings: number;
      sessions: number;
    }
  >,
  labels: StudioAnalyticsLabelRow[],
  session: StudioAnalyticsSessionRow,
  bookings: number,
  amountCents: number,
): void {
  const entry = map.get(session.coachId) ?? {
    id: session.coachId,
    label: findLabel(labels, session.coachId),
    amountCents: 0,
    bookings: 0,
    sessions: 0,
  };
  entry.amountCents += amountCents;
  entry.bookings += bookings;
  entry.sessions += 1;
  map.set(session.coachId, entry);
}

function findLabel(labels: StudioAnalyticsLabelRow[], id: string): string {
  return labels.find((item) => item.id === id)?.label ?? id;
}
