import { redirect } from "next/navigation";
import {
  ANALYTICS_SECTION_HREF,
  type AnalyticsSectionId,
} from "@/components/admin/admin-analytics-module";
import {
  ANALYTICS_BOOKINGS_SAMPLE_LIMIT,
  buildClassPopularity,
  buildCoachAttendance,
  buildCoachBookings,
  parseAnalyticsBookingStatus,
  parseAnalyticsQuickFilters,
  parseAnalyticsRangeDays,
  parseAnalyticsSortKey,
  resolveAnalyticsDateRange,
  resolveQuickFiltersSort,
} from "@/components/admin/admin-analytics-helpers";
import type {
  AdminAnalyticsPayload,
  AnalyticsClientsSummary,
  AnalyticsCoachRow,
  AnalyticsDashboardOverview,
  AnalyticsFinanceSummary,
} from "@/components/admin/admin-analytics-types";
import {
  analyticsSectionSearchNeedsSanitization,
  buildSanitizedAnalyticsSectionQueryString,
} from "@/components/admin/admin-analytics-url";
import { serverApiJson } from "@/lib/server-api";

type BookingsManagementResponse = {
  rows: Array<{
    recordType?: "BOOKING" | "WAITLIST";
    status: string;
    session: {
      classType: { id: string; name: string };
      coach: { id: string; name: string | null };
    };
  }>;
  summary: {
    total: number;
    booked: number;
    completed: number;
    cancelled: number;
    waitlisted: number;
  };
  filterOptions: {
    classTypes: Array<{ id: string; name: string }>;
    coaches: Array<{ id: string; name: string }>;
  };
  pagination?: { total: number; take: number; offset: number };
};

export type AnalyticsFilterOptions = BookingsManagementResponse["filterOptions"];

function buildBookingsQuery(
  fromIso: string,
  toIso: string,
  coachId: string,
  classTypeId: string,
  bookingStatus: string,
  options?: { countOnly?: boolean; sampleTake?: number },
): string {
  const params = new URLSearchParams();
  params.set("from", fromIso);
  params.set("to", toIso);
  if (coachId) {
    params.set("coachId", coachId);
  }
  if (classTypeId) {
    params.set("classTypeId", classTypeId);
  }
  if (bookingStatus) {
    params.set("status", bookingStatus);
  }
  if (options?.countOnly) {
    params.set("countOnly", "true");
    return `/bookings/admin/management?${params.toString()}`;
  }
  params.set("take", String(options?.sampleTake ?? ANALYTICS_BOOKINGS_SAMPLE_LIMIT));
  params.set("offset", "0");
  return `/bookings/admin/management?${params.toString()}`;
}

export async function loadAnalyticsFilterOptions(
  cookie: string,
): Promise<AnalyticsFilterOptions> {
  const now = new Date();
  const to = now.toISOString();
  const from = new Date(now);
  from.setDate(from.getDate() - 29);
  from.setHours(0, 0, 0, 0);
  const res = await serverApiJson<BookingsManagementResponse>(
    buildBookingsQuery(from.toISOString(), to, "", "", "", { countOnly: true }),
    cookie,
  );
  if (!res.ok) {
    return { classTypes: [], coaches: [] };
  }
  return res.data.filterOptions;
}

export async function loadAdminAnalyticsPayload(
  locale: string,
  search: Record<string, string | string[] | undefined>,
  cookie: string,
): Promise<{ ok: true; data: AdminAnalyticsPayload } | { ok: false; status: number }> {
  const rangeDays = parseAnalyticsRangeDays(
    Array.isArray(search.rangeDays) ? search.rangeDays[0] : search.rangeDays,
  );
  const quickRaw = Array.isArray(search.quick) ? search.quick[0] : search.quick;
  const quickFilters = parseAnalyticsQuickFilters(quickRaw);
  const { fromIso, toIso } = resolveAnalyticsDateRange({ rangeDays, quickFilters });
  const coachId = (Array.isArray(search.coachId) ? search.coachId[0] : search.coachId) ?? "";
  const classTypeId =
    (Array.isArray(search.classTypeId) ? search.classTypeId[0] : search.classTypeId) ?? "";
  const bookingStatus = parseAnalyticsBookingStatus(
    Array.isArray(search.bookingStatus) ? search.bookingStatus[0] : search.bookingStatus,
  );
  const sortFromQuick = resolveQuickFiltersSort(quickFilters);
  const sortRaw = Array.isArray(search.sort) ? search.sort[0] : search.sort;
  const sortKey = sortFromQuick ?? parseAnalyticsSortKey(sortRaw);

  const bookingsCountQuery = buildBookingsQuery(
    fromIso,
    toIso,
    coachId,
    classTypeId,
    bookingStatus,
    { countOnly: true },
  );
  const bookingsSampleQuery = buildBookingsQuery(
    fromIso,
    toIso,
    coachId,
    classTypeId,
    bookingStatus,
    { sampleTake: ANALYTICS_BOOKINGS_SAMPLE_LIMIT },
  );

  const [dashboardRes, financeRes, bookingsCountRes, bookingsRes, clientsRes, coachesRes] =
    await Promise.all([
      serverApiJson<AnalyticsDashboardOverview>(
        "/reports/dashboard?includeRevenue=true&includeOverview=true",
        cookie,
      ),
      serverApiJson<AnalyticsFinanceSummary>(
        `/reports/finance/summary?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`,
        cookie,
      ),
      serverApiJson<BookingsManagementResponse>(bookingsCountQuery, cookie),
      serverApiJson<BookingsManagementResponse>(bookingsSampleQuery, cookie),
      serverApiJson<{ summary: AnalyticsClientsSummary }>("/clients?meta=true", cookie),
      serverApiJson<AnalyticsCoachRow[]>("/coaches/admin/list", cookie),
    ]);

  if (
    !dashboardRes.ok ||
    !financeRes.ok ||
    !bookingsCountRes.ok ||
    !bookingsRes.ok ||
    !clientsRes.ok ||
    !coachesRes.ok
  ) {
    const failed = [
      dashboardRes,
      financeRes,
      bookingsCountRes,
      bookingsRes,
      clientsRes,
      coachesRes,
    ].find((res) => !res.ok);
    return { ok: false, status: failed && !failed.ok ? failed.status : 500 };
  }

  const bookingRows = bookingsRes.data.rows.filter(
    (row) => row.recordType === undefined || row.recordType === "BOOKING",
  );
  const missed = bookingRows.filter((row) => row.status === "MISSED").length;
  const matchedTotal =
    bookingsCountRes.data.pagination?.total ?? bookingsCountRes.data.summary.total;
  const isSampled = matchedTotal > bookingRows.length;

  return {
    ok: true,
    data: {
      locale,
      rangeDays,
      fromIso,
      toIso,
      sortKey,
      coachId,
      classTypeId,
      bookingStatus,
      quickFilters,
      dashboard: dashboardRes.data,
      finance: financeRes.data,
      bookings: {
        summary: {
          ...bookingsRes.data.summary,
          missed,
        },
        classPopularity: buildClassPopularity(bookingRows),
        coachBookings: buildCoachBookings(bookingRows),
        coachAttendance: buildCoachAttendance(bookingRows),
        filterOptions: bookingsRes.data.filterOptions,
        sampledLimit: ANALYTICS_BOOKINGS_SAMPLE_LIMIT,
        isSampled,
        matchedTotal,
        sampledRowCount: bookingRows.length,
      },
      clients: clientsRes.data.summary,
      coaches: coachesRes.data,
    },
  };
}

export function redirectIfUnscopedAnalyticsSearchParams(
  locale: string,
  section: AnalyticsSectionId,
  search: Record<string, string | string[] | undefined>,
): void {
  if (!analyticsSectionSearchNeedsSanitization(section, search)) {
    return;
  }
  const query = buildSanitizedAnalyticsSectionQueryString(section, search);
  const href = ANALYTICS_SECTION_HREF[section];
  redirect(query ? `/${locale}${href}?${query}` : `/${locale}${href}`);
}
