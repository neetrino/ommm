import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { formatDateForUi } from "@/lib/date-display";
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
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">
          {res.status === 401 || res.status === 403
            ? t("signInRequired")
            : t("loadFailed")}
        </div>
      </AdminContentFrame>
    );
  }

  if (res.data === null) {
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">{t("noProfile")}</div>
      </AdminContentFrame>
    );
  }

  const d = res.data;
  const trendPoints = d.trend.slice(-7);

  return (
    <AdminContentFrame>
      <AdminSectionShell>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className={adminChrome.metricCard}>
            <dt className={adminChrome.metricLabel}>{t("sessionsInRange")}</dt>
            <dd className={adminChrome.metricValue}>{d.totals.sessions}</dd>
          </div>
          <div className={adminChrome.metricCard}>
            <dt className={adminChrome.metricLabel}>{t("bookingsInRange")}</dt>
            <dd className={adminChrome.metricValue}>{d.totals.bookings}</dd>
          </div>
          <div className={adminChrome.metricCard}>
            <dt className={adminChrome.metricLabel}>{t("activeWaitlists")}</dt>
            <dd className={adminChrome.metricValue}>{d.totals.activeWaitlists}</dd>
          </div>
        </dl>
      </AdminSectionShell>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <article className={adminChrome.panel}>
          <p className={adminChrome.metricLabel}>{t("utilizationTitle")}</p>
          <p className={adminChrome.metricValue}>{d.totals.utilizationPercent}%</p>
          <p className={`mt-2 ${adminChrome.metaText}`}>
            {t("utilizationDescription", {
              booked: d.totals.bookings,
              sessions: d.totals.sessions,
            })}
          </p>
        </article>
        <article className={adminChrome.panel}>
          <p className={adminChrome.metricLabel}>{t("waitlistPressureTitle")}</p>
          <p className={adminChrome.metricValue}>{d.totals.waitlistPressurePercent}%</p>
          <p className={`mt-2 ${adminChrome.metaText}`}>
            {t("waitlistPressureDescription")}
          </p>
        </article>
      </section>

      <div className="mt-8">
        <AdminSectionShell>
          <h2 className={adminChrome.sectionTitle}>{t("trendTitle")}</h2>
          <ul className="mt-4 space-y-3">
            {trendPoints.map((point) => (
              <li key={point.date} className={adminChrome.panel}>
                <p className="text-sm font-medium text-sage-900">
                  {formatDateForUi(point.date)}
                </p>
                <p className={`mt-1 ${adminChrome.metaText}`}>
                  {t("trendRow", {
                    sessions: point.sessions,
                    bookings: point.bookings,
                    waitlists: point.waitlists,
                  })}
                </p>
              </li>
            ))}
          </ul>
        </AdminSectionShell>
      </div>
    </AdminContentFrame>
  );
}
