import { redirect } from "next/navigation";
import {
  ANALYTICS_SECTION_HREF,
  type AnalyticsSectionId,
} from "@/components/admin/admin-analytics-module";
import {
  buildClassPopularityBarItems,
  buildCoachMetricBarItems,
  buildDailyTrendFromStudio,
} from "@/components/admin/admin-analytics-studio-map";
import {
  parseAnalyticsBookingStatus,
  parseAnalyticsQuickFilters,
  parseAnalyticsRangeDays,
  parseAnalyticsSortKey,
  resolveAnalyticsDateRange,
  resolveQuickFiltersSort,
} from "@/components/admin/admin-analytics-helpers";
import type {
  AdminAnalyticsPayload,
  AnalyticsBookingsPayload,
  AnalyticsClientsSummary,
  AnalyticsCoachRow,
  AnalyticsDashboardOverview,
  AnalyticsFinanceSummary,
  StudioAnalyticsPayload,
} from "@/components/admin/admin-analytics-types";
import {
  analyticsSectionSearchNeedsSanitization,
  buildSanitizedAnalyticsSectionQueryString,
} from "@/components/admin/admin-analytics-url";
import { serverApiJson } from "@/lib/server-api";

type BookingsManagementResponse = {
  filterOptions: {
    classTypes: Array<{ id: string; name: string }>;
    coaches: Array<{ id: string; name: string }>;
  };
};

export type AnalyticsFilterOptions = BookingsManagementResponse["filterOptions"];

function buildAnalyticsQuery(
  fromIso: string,
  toIso: string,
  coachId: string,
  classTypeId: string,
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
  return `/reports/analytics?${params.toString()}`;
}

function buildFilterOptionsQuery(fromIso: string, toIso: string): string {
  const params = new URLSearchParams();
  params.set("from", fromIso);
  params.set("to", toIso);
  params.set("countOnly", "true");
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
    buildFilterOptionsQuery(from.toISOString(), to),
    cookie,
  );
  if (!res.ok) {
    return { classTypes: [], coaches: [] };
  }
  return res.data.filterOptions;
}

function mapDashboardFromStudio(studio: StudioAnalyticsPayload): AnalyticsDashboardOverview {
  return {
    sessionsToday: 0,
    bookingsToday: 0,
    activeWaitlists: studio.kpis.waitlistActive,
    activeMembers: studio.kpis.activeMembers,
    revenueCentsTotal: studio.kpis.revenueCents,
  };
}

function mapFinanceFromStudio(studio: StudioAnalyticsPayload): AnalyticsFinanceSummary {
  return {
    totals: {
      revenueCents: studio.kpis.revenueCents,
      successfulPaymentsCount: studio.kpis.successfulPaymentsCount,
      averageOrderValueCents: studio.kpis.averageOrderValueCents,
    },
    byStatus: studio.revenue.byStatus,
    bySource: studio.revenue.bySource,
    dailyRevenue: studio.daily.map((day) => ({
      date: day.dateKey,
      amountCents: day.revenueCents,
    })),
    giftCredits: studio.revenue.giftCredits,
  };
}

function mapBookingsFromStudio(
  studio: StudioAnalyticsPayload,
  filterOptions: AnalyticsFilterOptions,
  sortKey: AdminAnalyticsPayload["sortKey"],
): AnalyticsBookingsPayload {
  const status = studio.operations.bookingsByStatus;
  return {
    summary: {
      total: studio.kpis.bookingsTotal,
      booked: status.BOOKED,
      completed: status.COMPLETED,
      cancelled: status.CANCELLED,
      waitlisted: status.waitlisted,
      missed: status.MISSED,
    },
    classPopularity: buildClassPopularityBarItems(studio, sortKey),
    coachBookings: buildCoachMetricBarItems(studio, sortKey, "bookings", "", "N/A"),
    coachAttendance: buildCoachMetricBarItems(studio, sortKey, "attendance", "", "N/A"),
    filterOptions,
    sampledLimit: 0,
    isSampled: false,
    matchedTotal: studio.kpis.bookingsTotal,
    sampledRowCount: studio.kpis.bookingsTotal,
  };
}

function mapClientsFromStudio(studio: StudioAnalyticsPayload): AnalyticsClientsSummary {
  return {
    total: studio.members.total,
    active: studio.members.active,
    vip: studio.members.vip,
    totalVisits: studio.members.totalVisitsInRange,
    lifetimeValueCents: studio.members.lifetimeValueCents,
  };
}

function mapCoachesFromStudio(studio: StudioAnalyticsPayload): AnalyticsCoachRow[] {
  return studio.coaches.rows.map((row) => {
    const nameParts = row.name.trim().split(/\s+/);
    const firstName = nameParts[0] ?? null;
    const lastName = nameParts.slice(1).join(" ") || null;
    return {
      id: row.id,
      userId: row.id,
      isActive: row.isActive,
      totalClasses: row.sessions,
      user: {
        name: firstName,
        lastName,
        email: row.name,
      },
    };
  });
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

  const analyticsQuery = buildAnalyticsQuery(fromIso, toIso, coachId, classTypeId);
  const [analyticsRes, filterOptions] = await Promise.all([
    serverApiJson<StudioAnalyticsPayload>(analyticsQuery, cookie),
    loadAnalyticsFilterOptions(cookie),
  ]);

  if (!analyticsRes.ok) {
    return { ok: false, status: analyticsRes.status };
  }

  const studio = analyticsRes.data;
  const dailyTrend = buildDailyTrendFromStudio(studio, locale);

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
      studio,
      dashboard: mapDashboardFromStudio(studio),
      finance: mapFinanceFromStudio(studio),
      bookings: mapBookingsFromStudio(studio, filterOptions, sortKey),
      clients: mapClientsFromStudio(studio),
      coaches: mapCoachesFromStudio(studio),
      dailyTrend,
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
