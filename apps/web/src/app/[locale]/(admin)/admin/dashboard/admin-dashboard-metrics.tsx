import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminDashboardCharts } from "@/components/admin/admin-dashboard-charts";
import { loadDashboardTrendData } from "@/components/admin/admin-dashboard-trend-data";
import { AdminAnalyticsKpiStrip } from "@/components/admin/admin-analytics-kpi-strip";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import type { AnalyticsBarItem } from "@/components/admin/admin-analytics-types";
import { formatDateTimeForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import { serverApiJson } from "@/lib/server-api";

type BookingStatus = "BOOKED" | "COMPLETED" | "CANCELLED" | "MISSED";

type DashboardOverview = {
  sessionsToday: number;
  bookingsToday: number;
  activeWaitlists: number;
  activeMembers: number;
  revenueCentsTotal?: number;
  bookingsByStatus?: Record<BookingStatus, number>;
  upcomingClasses?: Array<{
    id: string;
    className: string;
    startsAt: string;
    coachName: string;
    bookedCount: number;
    capacity: number;
    status: string;
  }>;
  revenue?: {
    todayRevenueCents: number;
    monthRevenueCents: number;
    pendingPaymentsCents: number;
    pendingPaymentsCount: number;
    trendPercent: number | null;
  };
  upcomingCancellations?: Array<{
    id: string;
    type: "booking" | "package";
    userName: string;
    itemName: string;
    dateTime: string;
    status: string;
  }>;
  newUsers?: {
    todayCount: number;
    recent: Array<{
      id: string;
      name: string;
      email: string;
      createdAt: string;
    }>;
  };
  alerts?: Array<{
    code: string;
    level: "info" | "warning";
    count: number;
  }>;
};

function buildTodayBookingItems(
  bookingsByStatus: Record<BookingStatus, number>,
  labels: Record<BookingStatus, string>,
): AnalyticsBarItem[] {
  return (["BOOKED", "COMPLETED", "CANCELLED", "MISSED"] as const).map((key) => ({
    key,
    label: labels[key],
    value: bookingsByStatus[key],
  }));
}

export async function AdminDashboardMetrics({ locale }: { locale: string }) {
  const tm = await getTranslations({ locale, namespace: "adminHome.overview" });
  const cookie = (await headers()).get("cookie") ?? "";

  const [overviewRes, dailyTrend] = await Promise.all([
    serverApiJson<DashboardOverview>(
      "/reports/dashboard?includeRevenue=true&includeOverview=true",
      cookie,
    ),
    loadDashboardTrendData(locale, cookie),
  ]);

  if (!overviewRes.ok) {
    const message =
      overviewRes.status === 401 || overviewRes.status === 403
        ? tm("errorAuth")
        : tm("errorLoad", { status: overviewRes.status });
    return (
      <AdminContentFrame description={tm("pageDescription")}>
        <div className="app-alert-warn max-w-xl">{message}</div>
      </AdminContentFrame>
    );
  }

  const data = overviewRes.data;
  const monthRevenue = data.revenue?.monthRevenueCents ?? null;
  const upcomingClasses = data.upcomingClasses ?? [];
  const bookingsByStatus = data.bookingsByStatus ?? {
    BOOKED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    MISSED: 0,
  };
  const upcomingCancellations = data.upcomingCancellations ?? [];
  const recentUsers = data.newUsers?.recent ?? [];
  const alerts = data.alerts ?? [];

  const bookingLabels: Record<BookingStatus, string> = {
    BOOKED: tm("todayBookings.statusLabels.booked"),
    COMPLETED: tm("todayBookings.statusLabels.completed"),
    CANCELLED: tm("todayBookings.statusLabels.cancelled"),
    MISSED: tm("todayBookings.statusLabels.missed"),
  };

  const kpis = [
    {
      key: "sessions",
      label: tm("kpi.sessions"),
      value: String(data.sessionsToday),
    },
    {
      key: "bookings",
      label: tm("kpi.bookings"),
      value: String(data.bookingsToday),
    },
    {
      key: "members",
      label: tm("kpi.members"),
      value: String(data.activeMembers),
    },
    {
      key: "revenue",
      label: tm("kpi.revenue"),
      value:
        monthRevenue === null
          ? tm("cards.revenueSummary.noData")
          : formatAmdFromCents(monthRevenue, locale),
    },
    {
      key: "waitlist",
      label: tm("kpi.waitlist"),
      value: String(data.activeWaitlists),
    },
    {
      key: "alerts",
      label: tm("kpi.alerts"),
      value: String(alerts.length),
    },
  ];

  return (
    <AdminContentFrame description={tm("pageDescription")}>
      <AdminAnalyticsKpiStrip items={kpis} />

      <section className="mt-6">
        <AdminDashboardCharts
          locale={locale}
          dailyTrend={dailyTrend}
          todayBookingsItems={buildTodayBookingItems(bookingsByStatus, bookingLabels)}
        />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className={adminChrome.panel}>
          <div className="flex items-center justify-between gap-2">
            <p className={adminChrome.panelHeading}>{tm("todayClasses.title")}</p>
            <span className={adminChrome.metaText}>
              {tm("todayClasses.total", { count: data.sessionsToday })}
            </span>
          </div>
          {upcomingClasses.length === 0 ? (
            <p className="mt-3 text-sm text-sage-500">{tm("todayClasses.empty")}</p>
          ) : (
            <ul className="mt-3 divide-y divide-white/50">
              {upcomingClasses.map((session) => (
                <li key={session.id} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="mt-0.5 h-8 w-1 shrink-0 rounded-full bg-sage-300/80" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="truncate font-medium text-sage-900">{session.className}</p>
                      <span className="shrink-0 rounded-full border border-sage-200 bg-sage-50 px-2 py-0.5 text-[11px] text-sage-700">
                        {session.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-sage-500">
                      {tm("todayClasses.timeLine", {
                        dateTime: formatDateTimeForUi(session.startsAt, locale),
                        coachName: session.coachName,
                      })}
                    </p>
                    <p className="text-xs text-sage-500">
                      {tm("todayClasses.capacity", {
                        booked: session.bookedCount,
                        capacity: session.capacity,
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className={adminChrome.panel}>
          <p className={adminChrome.panelHeading}>{tm("revenue.title")}</p>
          {data.revenue ? (
            <dl className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2.5">
                <dt className="text-[11px] uppercase tracking-wide text-sage-500">{tm("revenue.today")}</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-sage-900">
                  {formatAmdFromCents(data.revenue.todayRevenueCents, locale)}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2.5">
                <dt className="text-[11px] uppercase tracking-wide text-sage-500">{tm("revenue.thisMonth")}</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-sage-900">
                  {formatAmdFromCents(data.revenue.monthRevenueCents, locale)}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2.5">
                <dt className="text-[11px] uppercase tracking-wide text-sage-500">{tm("revenue.pending")}</dt>
                <dd className="mt-1 text-sm font-semibold tabular-nums text-sage-900">
                  {tm("revenue.pendingValue", {
                    count: data.revenue.pendingPaymentsCount,
                    amount: formatAmdFromCents(data.revenue.pendingPaymentsCents, locale),
                  })}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-sage-500">{tm("revenue.empty")}</p>
          )}
          {data.revenue?.trendPercent !== null && data.revenue?.trendPercent !== undefined ? (
            <p className="mt-3 text-xs text-sage-500">
              {tm("revenue.trend", { percent: data.revenue.trendPercent })}
            </p>
          ) : null}
        </article>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <article className={`lg:col-span-2 ${adminChrome.panel}`}>
          <p className={adminChrome.panelHeading}>{tm("upcomingCancellations.title")}</p>
          {upcomingCancellations.length === 0 ? (
            <p className="mt-3 text-sm text-sage-500">{tm("upcomingCancellations.empty")}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {upcomingCancellations.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sage-900">{item.userName}</p>
                    <p className="mt-0.5 truncate text-xs text-sage-500">
                      {tm("upcomingCancellations.line", {
                        type:
                          item.type === "booking"
                            ? tm("upcomingCancellations.typeBooking")
                            : tm("upcomingCancellations.typeMembership"),
                        name: item.itemName,
                        dateTime: formatDateTimeForUi(item.dateTime, locale),
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className={adminChrome.panel}>
          <p className={adminChrome.panelHeading}>{tm("alerts.title")}</p>
          {alerts.length === 0 ? (
            <p className="mt-3 text-sm text-sage-500">{tm("alerts.empty")}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {alerts.map((alert) => (
                <li
                  key={alert.code}
                  className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm"
                >
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${
                      alert.level === "warning"
                        ? "border border-amber-300 bg-amber-50 text-amber-800"
                        : "border border-sage-300 bg-sage-50 text-sage-700"
                    }`}
                  >
                    {alert.level === "warning" ? tm("alerts.levelWarning") : tm("alerts.levelInfo")}
                  </span>
                  <p className="mt-1.5 text-sm font-medium text-sage-900">
                    {tm(`alerts.items.${alert.code}`)}
                  </p>
                  <p className="text-xs text-sage-500">{tm("alerts.count", { count: alert.count })}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="mt-4">
        <article className={adminChrome.panel}>
          <p className={adminChrome.panelHeading}>
            {tm("newUsers.title", { count: data.newUsers?.todayCount ?? 0 })}
          </p>
          {recentUsers.length === 0 ? (
            <p className="mt-3 text-sm text-sage-500">{tm("newUsers.empty")}</p>
          ) : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {recentUsers.map((user) => (
                <li
                  key={user.id}
                  className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm"
                >
                  <p className="truncate font-medium text-sage-900">{user.name}</p>
                  <p className="truncate text-xs text-sage-500">{user.email}</p>
                  <p className="mt-1 text-xs text-sage-500">
                    {tm("newUsers.joined", {
                      dateTime: formatDateTimeForUi(user.createdAt, locale),
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </AdminContentFrame>
  );
}
