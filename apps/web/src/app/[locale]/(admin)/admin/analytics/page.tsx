import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AdminAnalyticsShell } from "@/components/admin/admin-analytics-shell";
import {
  ANALYTICS_BOOKINGS_SAMPLE_LIMIT,
  buildClassPopularity,
  buildCoachBookings,
  parseAnalyticsQuickFilter,
  parseAnalyticsRangeDays,
  parseAnalyticsSortKey,
  parseAnalyticsViewMode,
  resolveAnalyticsDateRange,
} from "@/components/admin/admin-analytics-helpers";
import type {
  AdminAnalyticsPayload,
  AnalyticsClientsSummary,
  AnalyticsCoachRow,
  AnalyticsDashboardOverview,
  AnalyticsFinanceSummary,
  AnalyticsMembershipRow,
} from "@/components/admin/admin-analytics-types";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type PageSearchParams = Promise<{
  rangeDays?: string;
  view?: string;
  sort?: string;
  coachId?: string;
  classTypeId?: string;
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
};

const MEMBERSHIPS_SAMPLE_LIMIT = 500;

function buildBookingsQuery(fromIso: string, toIso: string, coachId: string, classTypeId: string) {
  const params = new URLSearchParams();
  params.set("from", fromIso);
  params.set("to", toIso);
  if (coachId) {
    params.set("coachId", coachId);
  }
  if (classTypeId) {
    params.set("classTypeId", classTypeId);
  }
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
  const quickFilter = parseAnalyticsQuickFilter(search.quick);
  const { fromIso, toIso } = resolveAnalyticsDateRange({ rangeDays, quickFilter });
  const coachId = search.coachId ?? "";
  const classTypeId = search.classTypeId ?? "";

  const bookingsQuery = buildBookingsQuery(fromIso, toIso, coachId, classTypeId);

  const [dashboardRes, financeRes, bookingsRes, clientsRes, coachesRes, membershipsRes] =
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
      serverApiJson<AnalyticsMembershipRow[]>(
        `/memberships/admin/all?take=${MEMBERSHIPS_SAMPLE_LIMIT}`,
        cookie,
      ),
    ]);

  if (
    !dashboardRes.ok ||
    !financeRes.ok ||
    !bookingsRes.ok ||
    !clientsRes.ok ||
    !coachesRes.ok ||
    !membershipsRes.ok
  ) {
    const failed = [
      dashboardRes,
      financeRes,
      bookingsRes,
      clientsRes,
      coachesRes,
      membershipsRes,
    ].find((res) => !res.ok);
    const status = failed && !failed.ok ? failed.status : 500;
    return (
      <AccountPageFrame title={t("title")} description={t("description")}>
        <div className="app-alert-warn max-w-xl">
          {status === 401 || status === 403 ? t("errorAuth") : t("errorLoad", { status })}
        </div>
      </AccountPageFrame>
    );
  }

  const bookingRows = bookingsRes.data.rows.filter(
    (row) => row.recordType === undefined || row.recordType === "BOOKING",
  );
  const missed = bookingRows.filter((row) => row.status === "MISSED").length;

  const payload: AdminAnalyticsPayload = {
    locale,
    rangeDays,
    fromIso,
    toIso,
    viewMode: parseAnalyticsViewMode(search.view),
    sortKey: parseAnalyticsSortKey(search.sort),
    coachId,
    classTypeId,
    quickFilter,
    dashboard: dashboardRes.data,
    finance: financeRes.data,
    bookings: {
      summary: {
        ...bookingsRes.data.summary,
        missed,
      },
      classPopularity: buildClassPopularity(bookingRows),
      coachBookings: buildCoachBookings(bookingRows),
      filterOptions: bookingsRes.data.filterOptions,
      sampledLimit: ANALYTICS_BOOKINGS_SAMPLE_LIMIT,
    },
    clients: clientsRes.data.summary,
    coaches: coachesRes.data,
    memberships: membershipsRes.data,
    membershipsSampledLimit: MEMBERSHIPS_SAMPLE_LIMIT,
  };

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <Suspense fallback={<p className="text-sm text-sage-500">{t("loading")}</p>}>
        <AdminAnalyticsShell data={payload} />
      </Suspense>
    </AccountPageFrame>
  );
}
