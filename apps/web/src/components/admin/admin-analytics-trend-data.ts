import type { AnalyticsDailyBucket } from "@/components/admin/admin-analytics-types";

export type { AnalyticsDailyBucket };

type BookingTrendRow = {
  status: string;
  session: { startsAt: string };
};

type RevenueDailyRow = {
  date: string;
  amountCents: number;
};

function eachDayInRange(fromIso: string, toIso: string): string[] {
  const days: string[] = [];
  const from = new Date(fromIso);
  const to = new Date(toIso);
  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);

  for (let cursor = new Date(from); cursor <= to; cursor.setDate(cursor.getDate() + 1)) {
    days.push(cursor.toISOString().slice(0, 10));
  }

  return days;
}

/** Builds zero-filled daily buckets for charts across the selected analytics range. */
export function buildAnalyticsDailyBuckets(
  fromIso: string,
  toIso: string,
  locale: string,
  bookingRows: BookingTrendRow[],
  revenueDaily: RevenueDailyRow[],
): AnalyticsDailyBucket[] {
  const bookingByDay = new Map<string, { total: number; completed: number }>();
  const revenueByDay = new Map(revenueDaily.map((row) => [row.date, row.amountCents]));
  const labelFormatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });

  for (const row of bookingRows) {
    const day = row.session.startsAt.slice(0, 10);
    const entry = bookingByDay.get(day) ?? { total: 0, completed: 0 };
    entry.total += 1;
    if (row.status === "COMPLETED") {
      entry.completed += 1;
    }
    bookingByDay.set(day, entry);
  }

  return eachDayInRange(fromIso, toIso).map((dateKey) => {
    const bookings = bookingByDay.get(dateKey) ?? { total: 0, completed: 0 };
    return {
      dateKey,
      label: labelFormatter.format(new Date(`${dateKey}T12:00:00`)),
      total: bookings.total,
      completed: bookings.completed,
      revenueCents: revenueByDay.get(dateKey) ?? 0,
    };
  });
}

/** Picks an x-axis label interval so longer ranges stay readable. */
export function resolveTrendAxisInterval(pointCount: number): number {
  if (pointCount <= 7) {
    return 0;
  }
  if (pointCount <= 31) {
    return 1;
  }
  return Math.max(1, Math.floor(pointCount / 12));
}

export function sumBucketValues(buckets: AnalyticsDailyBucket[], key: "total" | "completed" | "revenueCents"): number {
  return buckets.reduce((sum, bucket) => sum + bucket[key], 0);
}
