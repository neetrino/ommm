import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { formatAmdFromCents } from "@/lib/price-amd";
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
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">
          {t("loadFailed", { status: res.status })}
        </div>
      </AdminContentFrame>
    );
  }

  if (res.data == null) {
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">{t("noProfile")}</div>
      </AdminContentFrame>
    );
  }

  const data = res.data;
  return (
    <AdminContentFrame>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("total")}</p>
          <p className={adminChrome.metricValue}>
            {formatAmdFromCents(data.totalEarningsCents, locale)}
          </p>
        </li>
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("pending")}</p>
          <p className={adminChrome.metricValue}>
            {formatAmdFromCents(data.pendingPayoutCents, locale)}
          </p>
        </li>
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("paid")}</p>
          <p className={adminChrome.metricValue}>
            {formatAmdFromCents(data.paidOutCents, locale)}
          </p>
        </li>
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("sessions")}</p>
          <p className={adminChrome.metricValue}>{data.completedSessions}</p>
        </li>
      </ul>
      <div className="mt-8">
        <AdminSectionShell>
          <p className={adminChrome.panelHeading}>{t("lead")}</p>
          <p className="mt-2 text-sm text-sage-700">
            {t("formula", {
              base: formatAmdFromCents(data.basePerSessionCents, locale),
              perAttendee: formatAmdFromCents(data.perAttendeeShareCents, locale),
            })}
          </p>
        </AdminSectionShell>
      </div>
    </AdminContentFrame>
  );
}
