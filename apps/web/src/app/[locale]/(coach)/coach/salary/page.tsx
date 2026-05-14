import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type SalarySummary = {
  totalEarningsCents: number;
  pendingPayoutCents: number;
  paidOutCents: number;
  completedSessions: number;
  basePerSessionCents: number;
  perAttendeeShareCents: number;
};

export default async function CoachSalaryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "coachPages.salary" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<SalarySummary | null>("/coaches/panel/salary", cookie);

  if (!res.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {t("loadFailed", { status: res.status })}
      </div>
    );
  }

  if (res.data == null) {
    return (
      <div className="app-alert-warn max-w-xl">
        {t("noProfile")}
      </div>
    );
  }

  const data = res.data;
  const formatMoney = (cents: number) => (cents / 100).toFixed(2);
  return (
    <AccountPageFrame title={t("title")} description={t("lead")}>
      <ul className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("total")}</p>
          <p className={adminChrome.metricValue}>{formatMoney(data.totalEarningsCents)}</p>
        </li>
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("pending")}</p>
          <p className={adminChrome.metricValue}>{formatMoney(data.pendingPayoutCents)}</p>
        </li>
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("paid")}</p>
          <p className={adminChrome.metricValue}>{formatMoney(data.paidOutCents)}</p>
        </li>
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("sessions")}</p>
          <p className={adminChrome.metricValue}>{data.completedSessions}</p>
        </li>
      </ul>
      <section className={`mt-8 ${adminChrome.panel}`}>
        <p className={adminChrome.panelHeading}>{t("lead")}</p>
        <p className="mt-2">
          {t("formula", {
            base: formatMoney(data.basePerSessionCents),
            perAttendee: formatMoney(data.perAttendeeShareCents),
          })}
        </p>
      </section>
    </AccountPageFrame>
  );
}
