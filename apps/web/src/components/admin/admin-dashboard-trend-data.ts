import { ANALYTICS_BOOKINGS_SAMPLE_LIMIT } from "@/components/admin/admin-analytics-helpers";
import { buildAnalyticsDailyBuckets } from "@/components/admin/admin-analytics-trend-data";
import type { AnalyticsDailyBucket } from "@/components/admin/admin-analytics-types";
import { serverApiJson } from "@/lib/server-api";

export const DASHBOARD_TREND_DAYS = 7;

type BookingTrendRow = {
  recordType?: "BOOKING" | "WAITLIST";
  status: string;
  session: { startsAt: string };
};

type BookingsSampleResponse = {
  rows: BookingTrendRow[];
};

type FinanceSummaryResponse = {
  dailyRevenue?: Array<{ date: string; amountCents: number }>;
};

function resolveTrendRange(): { fromIso: string; toIso: string } {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const from = new Date(to);
  from.setDate(from.getDate() - (DASHBOARD_TREND_DAYS - 1));
  from.setHours(0, 0, 0, 0);
  return { fromIso: from.toISOString(), toIso: to.toISOString() };
}

function buildBookingsTrendQuery(fromIso: string, toIso: string): string {
  const params = new URLSearchParams();
  params.set("from", fromIso);
  params.set("to", toIso);
  params.set("take", String(ANALYTICS_BOOKINGS_SAMPLE_LIMIT));
  params.set("offset", "0");
  return `/bookings/admin/management?${params.toString()}`;
}

/** Loads a lightweight 7-day trend for the admin dashboard charts. */
export async function loadDashboardTrendData(
  locale: string,
  cookie: string,
): Promise<AnalyticsDailyBucket[]> {
  const { fromIso, toIso } = resolveTrendRange();
  const financeQuery = `/reports/finance/summary?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`;
  const bookingsQuery = buildBookingsTrendQuery(fromIso, toIso);

  const [financeRes, bookingsRes] = await Promise.all([
    serverApiJson<FinanceSummaryResponse>(financeQuery, cookie),
    serverApiJson<BookingsSampleResponse>(bookingsQuery, cookie),
  ]);

  if (!financeRes.ok || !bookingsRes.ok) {
    return [];
  }

  const bookingRows = bookingsRes.data.rows.filter(
    (row) => row.recordType === undefined || row.recordType === "BOOKING",
  );

  return buildAnalyticsDailyBuckets(
    fromIso,
    toIso,
    locale,
    bookingRows,
    financeRes.data.dailyRevenue ?? [],
  );
}
