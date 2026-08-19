import { BookingStatus } from '@prisma/client';
import { localDateKey } from './reports.helpers';
import type { AnalyticsMetricComparison } from './studio-analytics.types';

/** Safety net for compact findMany loads (yoga studio 90-day ranges stay well under this). */
export const STUDIO_ANALYTICS_ROW_CAP = 20_000;

export const UNKNOWN_PAYMENT_METHOD = 'UNKNOWN';

export const STUDIO_ANALYTICS_RANK_LIMIT = 10;

export const STUDIO_ANALYTICS_LABEL_CAP = 500;

export const UNKNOWN_PACKAGE_ID = 'unknown';

export const UNKNOWN_PACKAGE_LABEL = 'Unknown package';

export const UNASSIGNED_CLASS_TYPE_ID = 'unassigned';

export const UNASSIGNED_CLASS_TYPE_LABEL = 'Unassigned';

export const GIFT_CREDIT_SPEND_PREFIX = 'Gift credit spend';

export const ACTIVE_MEMBERS_LOOKBACK_MS = 30 * 24 * 60 * 60 * 1000;

export const PACKAGE_EXPIRING_MS = 7 * 24 * 60 * 60 * 1000;

export const OCCUPIED_BOOKING_STATUSES: ReadonlySet<BookingStatus> = new Set([
  BookingStatus.BOOKED,
  BookingStatus.COMPLETED,
  BookingStatus.MISSED,
]);

export function optionalFilterId(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

export function ratePercent(
  numerator: number,
  denominator: number,
): number | null {
  if (denominator <= 0) {
    return null;
  }
  return Math.round((numerator / denominator) * 100);
}

export function trendPercent(current: number, previous: number): number | null {
  if (previous === 0) {
    return null;
  }
  return Math.round(((current - previous) / previous) * 100);
}

export function toMetricComparison(
  current: number,
  previous: number,
): AnalyticsMetricComparison {
  return {
    current,
    previous,
    trendPercent: trendPercent(current, previous),
  };
}

export function resolvePreviousPeriod(
  from: Date,
  to: Date,
): { previousFrom: Date; previousTo: Date } {
  const durationMs = to.getTime() - from.getTime();
  const previousTo = new Date(from.getTime() - 1);
  const previousFrom = new Date(previousTo.getTime() - durationMs);
  return { previousFrom, previousTo };
}

export function eachLocalDateKey(from: Date, to: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (cursor.getTime() <= end.getTime()) {
    keys.push(localDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

export function isOccupiedBooking(status: BookingStatus): boolean {
  return OCCUPIED_BOOKING_STATUSES.has(status);
}

export function isAttributableConsumption(restoredAt: Date | null): boolean {
  return restoredAt === null;
}

export function consumptionAttributedCents(params: {
  planPriceCentsSnapshot: number;
  sessionsTotal: number | null;
  sessionPriceCents: number;
  consumedSessions: number;
}): number {
  const consumed = Math.max(0, params.consumedSessions);
  if (params.sessionsTotal !== null && params.sessionsTotal > 0) {
    const perSession = Math.round(
      params.planPriceCentsSnapshot / params.sessionsTotal,
    );
    return perSession * consumed;
  }
  return params.sessionPriceCents * consumed;
}

export function classifyMemberActivity(params: {
  createdAt: Date;
  firstCompletedAt: Date | null;
  rangeFrom: Date;
  rangeTo: Date;
  hasCompletedInRange: boolean;
  hasCompletedBeforeRange: boolean;
}): {
  isNewMember: boolean;
  isReturning: boolean;
  isFirstVisit: boolean;
} {
  const createdMs = params.createdAt.getTime();
  const inRange =
    createdMs >= params.rangeFrom.getTime() &&
    createdMs <= params.rangeTo.getTime();
  const firstVisitMs = params.firstCompletedAt?.getTime();
  const isFirstVisit =
    firstVisitMs !== undefined &&
    firstVisitMs >= params.rangeFrom.getTime() &&
    firstVisitMs <= params.rangeTo.getTime();
  return {
    isNewMember: inRange,
    isReturning: params.hasCompletedInRange && params.hasCompletedBeforeRange,
    isFirstVisit,
  };
}

export function emptyGiftCredits(): {
  issuedCents: number;
  issuedCount: number;
  redeemedCents: number;
  redeemedCount: number;
  spentCents: number;
  spendTransactionsCount: number;
  outstandingCreditsCents: number;
} {
  return {
    issuedCents: 0,
    issuedCount: 0,
    redeemedCents: 0,
    redeemedCount: 0,
    spentCents: 0,
    spendTransactionsCount: 0,
    outstandingCreditsCents: 0,
  };
}

export function emptyMemberCounts(): {
  total: number;
  active: number;
  vip: number;
  newInRange: number;
  returningInRange: number;
  inactive30d: number;
  firstVisitsInRange: number;
  totalVisitsInRange: number;
  lifetimeValueCents: number;
  retentionCohortSize: number;
  retentionReturned: number;
  packages: {
    active: number;
    paused: number;
    expiring7d: number;
    expiredInRange: number;
  };
} {
  return {
    total: 0,
    active: 0,
    vip: 0,
    newInRange: 0,
    returningInRange: 0,
    inactive30d: 0,
    firstVisitsInRange: 0,
    totalVisitsInRange: 0,
    lifetimeValueCents: 0,
    retentionCohortSize: 0,
    retentionReturned: 0,
    packages: {
      active: 0,
      paused: 0,
      expiring7d: 0,
      expiredInRange: 0,
    },
  };
}
