import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type PanelSummary = {
  coachProfileId: string;
  todaySessions: number;
  bookedToday: number;
  activeWaitlistsForCoachSessions: number;
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
    "/coaches/panel/summary",
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
  const utilizationPercent =
    d.todaySessions > 0 ? Math.round((d.bookedToday / d.todaySessions) * 100) : 0;
  const waitlistPressure =
    d.todaySessions > 0
      ? Math.round((d.activeWaitlistsForCoachSessions / d.todaySessions) * 100)
      : 0;

  return (
    <AccountPageFrame title={t("title")} description={t("lead")}>
      <ul className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("sessionsToday")}</p>
          <p className={adminChrome.metricValue}>{d.todaySessions}</p>
        </li>
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("bookingsToday")}</p>
          <p className={adminChrome.metricValue}>{d.bookedToday}</p>
        </li>
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("activeWaitlists")}</p>
          <p className={adminChrome.metricValue}>{d.activeWaitlistsForCoachSessions}</p>
        </li>
      </ul>
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <article className={adminChrome.panel}>
          <p className={adminChrome.metricLabel}>{t("utilizationTitle")}</p>
          <p className={adminChrome.metricValue}>{utilizationPercent}%</p>
          <p className={adminChrome.metaText}>
            {t("utilizationDescription", {
              booked: d.bookedToday,
              sessions: d.todaySessions,
            })}
          </p>
        </article>
        <article className={adminChrome.panel}>
          <p className={adminChrome.metricLabel}>{t("waitlistPressureTitle")}</p>
          <p className={adminChrome.metricValue}>{waitlistPressure}%</p>
          <p className={adminChrome.metaText}>
            {t("waitlistPressureDescription")}
          </p>
        </article>
      </section>
    </AccountPageFrame>
  );
}
