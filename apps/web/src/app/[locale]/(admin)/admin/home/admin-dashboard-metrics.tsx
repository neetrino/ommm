import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
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
    type: "booking" | "membership";
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

export async function AdminDashboardMetrics({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "adminHome" });
  const tm = await getTranslations({ locale, namespace: "adminHome.overview" });
  const cookie = (await headers()).get("cookie") ?? "";

  const overviewRes = await serverApiJson<DashboardOverview>(
    "/reports/dashboard?includeRevenue=true&includeOverview=true",
    cookie,
  );

  if (!overviewRes.ok) {
    const message =
      overviewRes.status === 401 || overviewRes.status === 403
        ? tm("errorAuth")
        : tm("errorLoad", { status: overviewRes.status });
    return (
      <AccountPageFrame title={t("pageTitle")} description={tm("pageDescription")}>
        <div className="app-alert-warn max-w-xl">{message}</div>
      </AccountPageFrame>
    );
  }

  const data = overviewRes.data;
  const todayRevenue = data.revenue?.todayRevenueCents ?? null;
  const monthRevenue = data.revenue?.monthRevenueCents ?? null;
  const pendingPayments = data.revenue?.pendingPaymentsCount ?? 0;
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

  const summaryCards = [
    {
      key: "sessions",
      title: tm("cards.todayClasses.title"),
      value: data.sessionsToday.toString(),
      helper: tm("cards.todayClasses.helper", { count: data.sessionsToday }),
      icon: "layoutGrid" as const,
    },
    {
      key: "bookings",
      title: tm("cards.todayBookings.title"),
      value: data.bookingsToday.toString(),
      helper: tm("cards.todayBookings.helper", { count: data.bookingsToday }),
      icon: "calendar" as const,
    },
    {
      key: "members",
      title: tm("cards.activeMembers.title"),
      value: data.activeMembers.toString(),
      helper: tm("cards.activeMembers.helper", { count: data.activeMembers }),
      icon: "users" as const,
    },
    {
      key: "waitlist",
      title: tm("cards.waitlistCount.title"),
      value: data.activeWaitlists.toString(),
      helper: tm("cards.waitlistCount.helper", { count: data.activeWaitlists }),
      icon: "listOrdered" as const,
    },
    {
      key: "revenue",
      title: tm("cards.revenueSummary.title"),
      value:
        monthRevenue === null
          ? tm("cards.revenueSummary.noData")
          : formatAmdFromCents(monthRevenue, locale),
      helper:
        monthRevenue === null
          ? tm("cards.revenueSummary.noDataHelper")
          : tm("cards.revenueSummary.helper", {
              todayRevenue: formatAmdFromCents(todayRevenue ?? 0, locale),
            }),
      icon: "wallet" as const,
    },
    {
      key: "cancellations",
      title: tm("cards.upcomingCancellations.title"),
      value: upcomingCancellations.length.toString(),
      helper: tm("cards.upcomingCancellations.helper", {
        count: upcomingCancellations.length,
      }),
      icon: "bell" as const,
    },
    {
      key: "users",
      title: tm("cards.newUsers.title"),
      value: (data.newUsers?.todayCount ?? 0).toString(),
      helper: tm("cards.newUsers.helper", { count: data.newUsers?.todayCount ?? 0 }),
      icon: "user" as const,
    },
    {
      key: "alerts",
      title: tm("cards.importantAlerts.title"),
      value: alerts.length.toString(),
      helper: tm("cards.importantAlerts.helper", { count: alerts.length }),
      icon: "fileText" as const,
    },
  ];

  return (
    <AccountPageFrame title={t("pageTitle")} description={tm("pageDescription")}>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <li
            key={card.key}
            className="rounded-[24px] border border-white/60 bg-white/65 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] transition hover:bg-white/75"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-sage-500">
                {card.title}
              </p>
              <DashboardNavIcon name={card.icon} className="h-5 w-5 text-sage-500" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-sage-900">{card.value}</p>
            <p className="mt-1 text-xs text-sage-500">{card.helper}</p>
          </li>
        ))}
      </ul>

      <section className="mt-8 grid gap-4 xl:grid-cols-3">
        <article className={`xl:col-span-2 ${adminChrome.panel}`}>
          <div className="flex items-center justify-between gap-2">
            <p className={adminChrome.panelHeading}>{tm("todayClasses.title")}</p>
            <span className="text-xs text-sage-500">
              {tm("todayClasses.total", { count: data.sessionsToday })}
            </span>
          </div>
          {upcomingClasses.length === 0 ? (
            <p className="mt-3 text-sm text-sage-500">{tm("todayClasses.empty")}</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {upcomingClasses.map((session) => (
                <li
                  key={session.id}
                  className="rounded-2xl border border-white/60 bg-white/70 p-3 text-sm text-sage-700"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-sage-900">{session.className}</p>
                    <span className="rounded-full border border-sage-200 bg-sage-50 px-2 py-0.5 text-xs text-sage-700">
                      {session.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-sage-500">
                    {tm("todayClasses.timeLine", {
                      dateTime: formatDateTimeForUi(session.startsAt, locale),
                      coachName: session.coachName,
                    })}
                  </p>
                  <p className="mt-1 text-xs text-sage-500">
                    {tm("todayClasses.capacity", {
                      booked: session.bookedCount,
                      capacity: session.capacity,
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className={adminChrome.panel}>
          <p className={adminChrome.panelHeading}>{tm("todayBookings.title")}</p>
          <p className="mt-2 text-3xl font-semibold text-sage-900">{data.bookingsToday}</p>
          <div className="mt-3 space-y-2 text-xs text-sage-600">
            <p>{tm("todayBookings.breakdown.booked", { count: bookingsByStatus.BOOKED })}</p>
            <p>{tm("todayBookings.breakdown.completed", { count: bookingsByStatus.COMPLETED })}</p>
            <p>{tm("todayBookings.breakdown.cancelled", { count: bookingsByStatus.CANCELLED })}</p>
            <p>{tm("todayBookings.breakdown.missed", { count: bookingsByStatus.MISSED })}</p>
          </div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <article className={adminChrome.panel}>
          <p className={adminChrome.panelHeading}>{tm("revenue.title")}</p>
          {data.revenue ? (
            <div className="mt-3 space-y-2 text-sm text-sage-700">
              <p className="flex items-center justify-between gap-2">
                <span>{tm("revenue.today")}</span>
                <span className="font-medium text-sage-900">
                  {formatAmdFromCents(data.revenue.todayRevenueCents, locale)}
                </span>
              </p>
              <p className="flex items-center justify-between gap-2">
                <span>{tm("revenue.thisMonth")}</span>
                <span className="font-medium text-sage-900">
                  {formatAmdFromCents(data.revenue.monthRevenueCents, locale)}
                </span>
              </p>
              <p className="flex items-center justify-between gap-2">
                <span>{tm("revenue.pending")}</span>
                <span className="font-medium text-sage-900">
                  {tm("revenue.pendingValue", {
                    count: pendingPayments,
                    amount: formatAmdFromCents(data.revenue.pendingPaymentsCents, locale),
                  })}
                </span>
              </p>
              {data.revenue.trendPercent !== null ? (
                <p className="text-xs text-sage-500">
                  {tm("revenue.trend", { percent: data.revenue.trendPercent })}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-sm text-sage-500">{tm("revenue.empty")}</p>
          )}
        </article>

        <article className={`xl:col-span-2 ${adminChrome.panel}`}>
          <p className={adminChrome.panelHeading}>{tm("upcomingCancellations.title")}</p>
          {upcomingCancellations.length === 0 ? (
            <p className="mt-3 text-sm text-sage-500">{tm("upcomingCancellations.empty")}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {upcomingCancellations.map((item) => (
                <li
                  key={item.id}
                  className="rounded-2xl border border-white/60 bg-white/70 p-3 text-sm text-sage-700"
                >
                  <p className="font-medium text-sage-900">{item.userName}</p>
                  <p className="mt-1 text-xs text-sage-500">
                    {tm("upcomingCancellations.line", {
                      type:
                        item.type === "booking"
                          ? tm("upcomingCancellations.typeBooking")
                          : tm("upcomingCancellations.typeMembership"),
                      name: item.itemName,
                      dateTime: formatDateTimeForUi(item.dateTime, locale),
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <article className={adminChrome.panel}>
          <p className={adminChrome.panelHeading}>
            {tm("newUsers.title", { count: data.newUsers?.todayCount ?? 0 })}
          </p>
          {recentUsers.length === 0 ? (
            <p className="mt-3 text-sm text-sage-500">{tm("newUsers.empty")}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {recentUsers.map((user) => (
                <li
                  key={user.id}
                  className="rounded-2xl border border-white/60 bg-white/70 p-3 text-sm text-sage-700"
                >
                  <p className="font-medium text-sage-900">{user.name}</p>
                  <p className="text-xs text-sage-500">{user.email}</p>
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

        <article className={adminChrome.panel}>
          <p className={adminChrome.panelHeading}>{tm("alerts.title")}</p>
          {alerts.length === 0 ? (
            <p className="mt-3 text-sm text-sage-500">{tm("alerts.empty")}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {alerts.map((alert) => (
                <li
                  key={alert.code}
                  className="rounded-2xl border border-white/60 bg-white/70 p-3 text-sm text-sage-700"
                >
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                      alert.level === "warning"
                        ? "border border-amber-300 bg-amber-50 text-amber-800"
                        : "border border-sage-300 bg-sage-50 text-sage-700"
                    }`}
                  >
                    {alert.level === "warning" ? tm("alerts.levelWarning") : tm("alerts.levelInfo")}
                  </span>
                  <p className="mt-2 font-medium text-sage-900">{tm(`alerts.items.${alert.code}`)}</p>
                  <p className="mt-1 text-xs text-sage-500">{tm("alerts.count", { count: alert.count })}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className={`mt-4 ${adminChrome.panel}`}>
        <p className={adminChrome.panelHeading}>{t("csvExportTitle")}</p>
        <p className="mt-2 text-sm text-sage-600">{t("csvExportBody")}</p>
      </section>
    </AccountPageFrame>
  );
}
