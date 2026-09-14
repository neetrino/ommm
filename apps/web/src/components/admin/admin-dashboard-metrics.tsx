import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminDashboardCharts } from "@/components/admin/admin-dashboard-charts";
import { AdminDashboardKpiHero } from "@/components/admin/admin-dashboard-kpi-hero";
import { AdminDashboardNewUsers } from "@/components/admin/admin-dashboard-new-users";
import { loadDashboardTrendData } from "@/components/admin/admin-dashboard-trend-data";
import { AdminCallTasksDueBanner } from "@/components/admin/admin-call-tasks-due-banner";
import { AdminDashboardPaymentDueBanner } from "@/components/admin/admin-dashboard-payment-due-banner";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import {
  buildRevenueTrendKpi,
  buildTodayBookingItems,
  type DashboardBookingStatus,
  type DashboardOverview,
} from "@/components/admin/admin-dashboard-metrics.helpers";
import { formatDateTimeForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import { serverApiJson } from "@/lib/server-api";

export type AdminDashboardMetricsProps = {
  locale: string;
  /** When false, finance KPIs/charts and payment alerts are omitted (Manager). */
  includeFinance?: boolean;
};

export async function AdminDashboardMetrics({
  locale,
  includeFinance = true,
}: AdminDashboardMetricsProps) {
  const tm = await getTranslations({ locale, namespace: "adminHome.overview" });
  const cookie = (await headers()).get("cookie") ?? "";
  const dashboardQuery = includeFinance
    ? "/reports/dashboard?includeRevenue=true&includeOverview=true"
    : "/reports/dashboard?includeOverview=true";

  const [overviewRes, dailyTrend] = await Promise.all([
    serverApiJson<DashboardOverview>(dashboardQuery, cookie),
    loadDashboardTrendData(locale, cookie, { includeFinance }),
  ]);

  if (!overviewRes.ok) {
    const message =
      overviewRes.status === 401 || overviewRes.status === 403
        ? tm("errorAuth")
        : tm("errorLoad", { status: overviewRes.status });
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">{message}</div>
      </AdminContentFrame>
    );
  }

  const data = overviewRes.data;
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
  const studioPaymentDue = data.studioPaymentDue ?? { count: 0, items: [] };

  const bookingLabels: Record<DashboardBookingStatus, string> = {
    BOOKED: tm("todayBookings.statusLabels.booked"),
    COMPLETED: tm("todayBookings.statusLabels.completed"),
    CANCELLED: tm("todayBookings.statusLabels.cancelled"),
    MISSED: tm("todayBookings.statusLabels.missed"),
  };

  const kpisOperations = [
    { label: tm("kpi.sessions"), value: String(data.sessionsToday) },
    { label: tm("kpi.bookings"), value: String(data.bookingsToday) },
    { label: tm("kpi.members"), value: String(data.activeMembers) },
    { label: tm("kpi.waitlist"), value: String(data.activeWaitlists) },
    { label: tm("kpi.alerts"), value: String(alerts.length) },
    { label: tm("kpi.newUsers"), value: String(data.newUsers?.todayCount ?? 0) },
  ];

  const kpisFinance =
    includeFinance && data.revenue
      ? [
          {
            label: tm("revenue.today"),
            value: formatAmdFromCents(data.revenue.todayRevenueCents, locale),
          },
          {
            label: tm("revenue.thisMonth"),
            value: formatAmdFromCents(data.revenue.monthRevenueCents, locale),
          },
          {
            label: tm("revenue.pendingWithCount", {
              count: data.revenue.pendingPaymentsCount,
            }),
            value: formatAmdFromCents(data.revenue.pendingPaymentsCents, locale),
          },
          {
            label: tm("revenue.trendLabel"),
            ...buildRevenueTrendKpi(data.revenue.trendPercent, tm("revenue.trendUnavailable")),
          },
        ]
      : includeFinance
        ? [{ label: tm("revenue.thisMonth"), value: tm("cards.revenueSummary.noData") }]
        : undefined;

  return (
    <AdminContentFrame>
      <AdminDashboardPaymentDueBanner
        items={studioPaymentDue.items}
        count={studioPaymentDue.count}
        locale={locale}
      />
      <AdminCallTasksDueBanner
        listHref={includeFinance ? "/admin/calls" : "/manager/calls"}
      />
      <AdminDashboardKpiHero
        operationsTitle={tm("kpi.groupOperations")}
        financeTitle={includeFinance ? tm("kpi.groupFinance") : undefined}
        operations={kpisOperations}
        finance={kpisFinance}
      />

      <section className="mt-6">
        <AdminDashboardCharts
          locale={locale}
          dailyTrend={dailyTrend}
          todayBookingsItems={buildTodayBookingItems(bookingsByStatus, bookingLabels)}
          includeFinance={includeFinance}
        />
      </section>

      <section className="mt-4">
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
                    <p className="mt-0.5 text-xs tabular-nums text-sage-500">
                      {formatDateTimeForUi(item.dateTime, locale)}
                    </p>
                    <p className="mt-0.5 text-xs text-sage-500">
                      {item.type === "booking"
                        ? tm("upcomingCancellations.typeBooking")
                        : tm("upcomingCancellations.typeMembership")}
                      {": "}
                      {item.itemName}
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

      <AdminDashboardNewUsers
        locale={locale}
        todayCount={data.newUsers?.todayCount ?? 0}
        users={recentUsers}
      />
    </AdminContentFrame>
  );
}
