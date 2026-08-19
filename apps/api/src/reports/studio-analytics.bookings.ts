import { BookingStatus, PaymentStatus, WaitlistStatus } from '@prisma/client';
import { localDateKey } from './reports.helpers';
import {
  eachLocalDateKey,
  isOccupiedBooking,
  ratePercent,
} from './studio-analytics.helpers';
import type {
  StudioAnalyticsBookingGroup,
  StudioAnalyticsLabelRow,
  StudioAnalyticsLoadedRange,
  StudioAnalyticsPayload,
  StudioAnalyticsSessionRow,
  StudioAnalyticsWaitlistGroup,
} from './studio-analytics.types';

export type SessionBookingStats = {
  booked: number;
  completed: number;
  cancelled: number;
  missed: number;
  total: number;
  occupied: number;
  website: number;
  app: number;
};

export type WaitlistSummary = {
  active: number;
  offered: number;
  converted: number;
  expired: number;
  removed: number;
  conversionRate: number | null;
  bySessionActive: Map<string, number>;
};

export type BookingIndex = {
  bySession: Map<string, SessionBookingStats>;
  totals: SessionBookingStats;
};

export function emptySessionStats(): SessionBookingStats {
  return {
    booked: 0,
    completed: 0,
    cancelled: 0,
    missed: 0,
    total: 0,
    occupied: 0,
    website: 0,
    app: 0,
  };
}

export function indexBookingGroups(
  groups: StudioAnalyticsBookingGroup[],
): BookingIndex {
  const bySession = new Map<string, SessionBookingStats>();
  const totals = emptySessionStats();
  for (const group of groups) {
    const stats = bySession.get(group.sessionId) ?? emptySessionStats();
    applyBookingGroup(stats, group);
    applyBookingGroup(totals, group);
    bySession.set(group.sessionId, stats);
  }
  return { bySession, totals };
}

function applyBookingGroup(
  stats: SessionBookingStats,
  group: StudioAnalyticsBookingGroup,
): void {
  stats.total += group.count;
  if (group.status === BookingStatus.BOOKED) stats.booked += group.count;
  if (group.status === BookingStatus.COMPLETED) stats.completed += group.count;
  if (group.status === BookingStatus.CANCELLED) stats.cancelled += group.count;
  if (group.status === BookingStatus.MISSED) stats.missed += group.count;
  if (isOccupiedBooking(group.status)) stats.occupied += group.count;
  if (group.channel === 'WEBSITE') stats.website += group.count;
  if (group.channel === 'APP') stats.app += group.count;
}

export function summarizeWaitlist(
  groups: StudioAnalyticsWaitlistGroup[],
): WaitlistSummary {
  const bySessionActive = new Map<string, number>();
  const counts = {
    active: 0,
    offered: 0,
    converted: 0,
    expired: 0,
    removed: 0,
  };
  for (const group of groups) {
    addWaitlistCount(counts, bySessionActive, group);
  }
  const denom =
    counts.converted +
    counts.expired +
    counts.removed +
    counts.active +
    counts.offered;
  return {
    ...counts,
    conversionRate: ratePercent(counts.converted, denom),
    bySessionActive,
  };
}

function addWaitlistCount(
  counts: {
    active: number;
    offered: number;
    converted: number;
    expired: number;
    removed: number;
  },
  bySessionActive: Map<string, number>,
  group: StudioAnalyticsWaitlistGroup,
): void {
  if (group.status === WaitlistStatus.ACTIVE) {
    counts.active += group.count;
    bySessionActive.set(
      group.sessionId,
      (bySessionActive.get(group.sessionId) ?? 0) + group.count,
    );
  }
  if (group.status === WaitlistStatus.OFFERED) counts.offered += group.count;
  if (group.status === WaitlistStatus.CONVERTED)
    counts.converted += group.count;
  if (group.status === WaitlistStatus.EXPIRED) counts.expired += group.count;
  if (group.status === WaitlistStatus.REMOVED) counts.removed += group.count;
}

export function buildDailySeries(
  input: StudioAnalyticsLoadedRange,
  bySession: Map<string, SessionBookingStats>,
): StudioAnalyticsPayload['daily'] {
  const keys = eachLocalDateKey(input.from, input.to);
  const map = new Map(
    keys.map((dateKey) => [dateKey, emptyDailyBucket(dateKey)]),
  );
  addSessionDailyStats(map, input.sessions, bySession);
  addPaymentDailyRevenue(map, input);
  return keys.map((dateKey) => {
    const bucket = map.get(dateKey) ?? emptyDailyBucket(dateKey);
    return {
      ...bucket,
      occupancyRate: ratePercent(bucket.occupiedSeats, bucket.capacity),
    };
  });
}

function addSessionDailyStats(
  map: Map<string, StudioAnalyticsPayload['daily'][number]>,
  sessions: StudioAnalyticsSessionRow[],
  bySession: Map<string, SessionBookingStats>,
): void {
  for (const session of sessions) {
    const bucket = map.get(localDateKey(session.startsAt));
    if (!bucket) continue;
    const stats = bySession.get(session.id) ?? emptySessionStats();
    bucket.bookings += stats.total;
    bucket.completed += stats.completed;
    bucket.cancelled += stats.cancelled;
    bucket.missed += stats.missed;
    bucket.occupiedSeats += stats.occupied;
    bucket.capacity += session.capacity;
  }
}

function addPaymentDailyRevenue(
  map: Map<string, StudioAnalyticsPayload['daily'][number]>,
  input: StudioAnalyticsLoadedRange,
): void {
  for (const payment of input.payments) {
    if (payment.status !== PaymentStatus.SUCCEEDED) continue;
    const bucket = map.get(localDateKey(payment.createdAt));
    if (bucket) bucket.revenueCents += payment.amountCents;
  }
}

function emptyDailyBucket(
  dateKey: string,
): StudioAnalyticsPayload['daily'][number] {
  return {
    dateKey,
    bookings: 0,
    completed: 0,
    cancelled: 0,
    missed: 0,
    revenueCents: 0,
    occupiedSeats: 0,
    capacity: 0,
    occupancyRate: null,
  };
}

export function buildOperations(
  input: StudioAnalyticsLoadedRange,
  bookings: BookingIndex,
  waitlist: WaitlistSummary,
): StudioAnalyticsPayload['operations'] {
  const weekdays = Array.from({ length: 7 }, () => 0);
  const hours = Array.from({ length: 24 }, () => 0);
  for (const session of input.sessions) {
    const count = bookings.bySession.get(session.id)?.total ?? 0;
    weekdays[session.startsAt.getDay()] += count;
    hours[session.startsAt.getHours()] += count;
  }
  return {
    bookingsByStatus: {
      BOOKED: bookings.totals.booked,
      COMPLETED: bookings.totals.completed,
      CANCELLED: bookings.totals.cancelled,
      MISSED: bookings.totals.missed,
      waitlisted: waitlist.active,
    },
    classPopularity: buildClassPopularity(input, bookings),
    peakWeekdays: weekdays.map((count, weekday) => ({
      weekday,
      bookings: count,
    })),
    peakHours: hours.map((count, hour) => ({ hour, bookings: count })),
    channels: { WEBSITE: bookings.totals.website, APP: bookings.totals.app },
    waitlist: {
      active: waitlist.active,
      offered: waitlist.offered,
      converted: waitlist.converted,
      expired: waitlist.expired,
      removed: waitlist.removed,
      conversionRate: waitlist.conversionRate,
    },
  };
}

function buildClassPopularity(
  input: StudioAnalyticsLoadedRange,
  bookings: BookingIndex,
): StudioAnalyticsPayload['operations']['classPopularity'] {
  const buckets = new Map<
    string,
    {
      id: string;
      label: string;
      bookings: number;
      occupied: number;
      capacity: number;
    }
  >();
  for (const session of input.sessions) {
    addClassPopularityBucket(buckets, input.classTypes, session, bookings);
  }
  return [...buckets.values()]
    .map((bucket) => ({
      id: bucket.id,
      label: bucket.label,
      bookings: bucket.bookings,
      occupancyRate: ratePercent(bucket.occupied, bucket.capacity),
    }))
    .sort((left, right) => right.bookings - left.bookings);
}

function addClassPopularityBucket(
  buckets: Map<
    string,
    {
      id: string;
      label: string;
      bookings: number;
      occupied: number;
      capacity: number;
    }
  >,
  labels: StudioAnalyticsLabelRow[],
  session: StudioAnalyticsSessionRow,
  bookings: BookingIndex,
): void {
  const stats = bookings.bySession.get(session.id) ?? emptySessionStats();
  const bucket = buckets.get(session.classTypeId) ?? {
    id: session.classTypeId,
    label:
      labels.find((item) => item.id === session.classTypeId)?.label ??
      session.classTypeId,
    bookings: 0,
    occupied: 0,
    capacity: 0,
  };
  bucket.bookings += stats.total;
  bucket.occupied += stats.occupied;
  bucket.capacity += session.capacity;
  buckets.set(session.classTypeId, bucket);
}
