import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AdminAnalyticsShell } from "@/components/admin/admin-analytics-shell";
import {
  ANALYTICS_BOOKINGS_SAMPLE_LIMIT,
  buildClassPopularity,
  buildCoachAttendance,
  buildCoachBookings,
  parseAnalyticsBookingStatus,
  parseAnalyticsQuickFilters,
  parseAnalyticsRangeDays,
  parseAnalyticsSortKey,
  parseAnalyticsViewMode,
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
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { serverApiJson } from "@/lib/server-api";

type PageSearchParams = Promise<{
  rangeDays?: string;
  view?: string;
  sort?: string;
  coachId?: string;
  classTypeId?: string;
  bookingStatus?: string;
  quick?: string;
}>;

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

function buildBookingsQuery(
  fromIso: string,
  toIso: string,
  coachId: string,
  classTypeId: string,
  bookingStatus: string,
) {
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
  params.set("take", String(ANALYTICS_BOOKINGS_SAMPLE_LIMIT));
  params.set("offset", "0");
  return `/bookings/admin/management?${params.toString()}`;
}

export default async function AdminAnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: PageSearchParams;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.analytics" });
  const cookie = (await headers()).get("cookie") ?? "";

  const rangeDays = parseAnalyticsRangeDays(search.rangeDays);
  const quickFilters = parseAnalyticsQuickFilters(search.quick);
  const { fromIso, toIso } = resolveAnalyticsDateRange({ rangeDays, quickFilters });
  const coachId = search.coachId ?? "";
  const classTypeId = search.classTypeId ?? "";
  const bookingStatus = parseAnalyticsBookingStatus(search.bookingStatus);
  const sortFromQuick = resolveQuickFiltersSort(quickFilters);
  const sortKey = sortFromQuick ?? parseAnalyticsSortKey(search.sort);

  const bookingsQuery = buildBookingsQuery(fromIso, toIso, coachId, classTypeId, bookingStatus);

  const [dashboardRes, financeRes, bookingsRes, clientsRes, coachesRes] =
    await Promise.all([
      serverApiJson<AnalyticsDashboardOverview>(
        "/reports/dashboard?includeRevenue=true&includeOverview=true",
        cookie,
      ),
      serverApiJson<AnalyticsFinanceSummary>(
        `/reports/finance/summary?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`,
        cookie,
      ),
      serverApiJson<BookingsManagementResponse>(bookingsQuery, cookie),
      serverApiJson<{ summary: AnalyticsClientsSummary }>("/clients?meta=true", cookie),
      serverApiJson<AnalyticsCoachRow[]>("/coaches/admin/list", cookie),
    ]);

  if (
    !dashboardRes.ok ||
    !financeRes.ok ||
    !bookingsRes.ok ||
    !clientsRes.ok ||
    !coachesRes.ok
  ) {
    const failed = [
      dashboardRes,
      financeRes,
      bookingsRes,
      clientsRes,
      coachesRes,
    ].find((res) => !res.ok);
    const status = failed && !failed.ok ? failed.status : 500;
    return (
      <AdminContentFrame description={t("description")}>
        <div className="app-alert-warn max-w-xl">
          {status === 401 || status === 403 ? t("errorAuth") : t("errorLoad", { status })}
        </div>
      </AdminContentFrame>
    );
  }

  const bookingRows = bookingsRes.data.rows.filter(
    (row) => row.recordType === undefined || row.recordType === "BOOKING",
  );
  const missed = bookingRows.filter((row) => row.status === "MISSED").length;
  const matchedTotal = bookingsRes.data.pagination?.total ?? bookingRows.length;
  const isSampled = matchedTotal >= ANALYTICS_BOOKINGS_SAMPLE_LIMIT;

  const payload: AdminAnalyticsPayload = {
    locale,
    rangeDays,
    fromIso,
    toIso,
    viewMode: parseAnalyticsViewMode(search.view),
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
  };

  return (
    <AdminContentFrame description={t("description")}>
      <AdminSectionShell>
        <Suspense fallback={<p className="text-sm text-sage-500">{t("loading")}</p>}>
          <AdminAnalyticsShell data={payload} />
        </Suspense>
      </AdminSectionShell>
    </AdminContentFrame>
  );
}
