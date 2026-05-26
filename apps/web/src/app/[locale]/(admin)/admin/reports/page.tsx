import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";
import { AdminReportsSummary } from "./admin-reports-summary";

type Dashboard = {
  sessionsToday: number;
  bookingsToday: number;
  activeWaitlists: number;
  activeMembers: number;
};

export default async function AdminReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.reports" });
  const cookie = (await headers()).get("cookie") ?? "";
  const dashboardRes = await serverApiJson<Dashboard>("/reports/dashboard", cookie);

  if (!dashboardRes.ok) {
    const status = dashboardRes.status;
    return (
      <div className="app-alert-warn max-w-xl">
        {status === 401 || status === 403
          ? t("errorAuth")
          : t("errorLoad", { status })}
      </div>
    );
  }

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <AdminReportsSummary data={dashboardRes.data} locale={locale} />
      <section className="mt-8 rounded-[20px] border border-white/60 bg-white/70 p-4 text-sm text-sage-700">
        <p className="font-medium text-sage-900">{t("financeMovedHeading")}</p>
        <p className="mt-2 text-xs text-sage-600">{t("financeMovedHint")}</p>
      </section>
    </AccountPageFrame>
  );
}
