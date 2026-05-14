import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type PanelSummary = {
  range: { from: string; to: string };
  totals: {
    sessions: number;
    bookings: number;
    activeWaitlists: number;
    utilizationPercent: number;
    waitlistPressurePercent: number;
  };
  trend: Array<{
    date: string;
    sessions: number;
    bookings: number;
    waitlists: number;
    capacity: number;
  }>;
};

export default async function CoachAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "coachPages.analytics" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<PanelSummary | null>(
    "/reports/coach/analytics?days=30",
    cookie,
  );

  if (!res.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {res.status === 401 || res.status === 403
          ? t("signInRequired")
          : t("loadFailed")}
      </div>
    );
  }

  if (res.data === null) {
    return (
      <div className="app-alert-warn max-w-xl">
        {t("noProfile")}
      </div>
    );
  }

  const d = res.data;
  const trendPoints = d.trend.slice(-7);

  return (
    <AccountPageFrame title={t("title")} description={t("lead")}>
      <ul className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("sessionsInRange")}</p>
          <p className={adminChrome.metricValue}>{d.totals.sessions}</p>
        </li>
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("bookingsInRange")}</p>
          <p className={adminChrome.metricValue}>{d.totals.bookings}</p>
        </li>
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("activeWaitlists")}</p>
          <p className={adminChrome.metricValue}>{d.totals.activeWaitlists}</p>
        </li>
      </ul>
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <article className={adminChrome.panel}>
          <p className={adminChrome.metricLabel}>{t("utilizationTitle")}</p>
          <p className={adminChrome.metricValue}>{d.totals.utilizationPercent}%</p>
          <p className={adminChrome.metaText}>
            {t("utilizationDescription", {
              booked: d.totals.bookings,
              sessions: d.totals.sessions,
            })}
          </p>
        </article>
        <article className={adminChrome.panel}>
          <p className={adminChrome.metricLabel}>{t("waitlistPressureTitle")}</p>
          <p className={adminChrome.metricValue}>{d.totals.waitlistPressurePercent}%</p>
          <p className={adminChrome.metaText}>
            {t("waitlistPressureDescription")}
          </p>
        </article>
      </section>
      <section className="mt-8 rounded-[20px] border border-white/60 bg-white/70 p-4 text-sm text-sage-700">
        <p className="font-medium text-sage-900">{t("trendTitle")}</p>
        <ul className="mt-3 grid gap-2">
          {trendPoints.map((point) => (
            <li key={point.date} className="ommm-inset-row">
              <span className="font-medium text-sage-800">
                {new Date(point.date).toLocaleDateString(locale)}
              </span>
              <span className="ml-2 text-sage-500">
                {t("trendRow", {
                  sessions: point.sessions,
                  bookings: point.bookings,
                  waitlists: point.waitlists,
                })}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </AccountPageFrame>
  );
}
