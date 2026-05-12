import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";
import { AdminReportsSummary } from "./admin-reports-summary";

type Dashboard = {
  sessionsToday: number;
  bookingsToday: number;
  activeWaitlists: number;
  activeMembers: number;
  revenueCentsTotal: number;
};

export default async function AdminReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.reports" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<Dashboard>("/reports/dashboard", cookie);

  if (!res.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {res.status === 401 || res.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: res.status })}
      </div>
    );
  }

  return (
    <AccountPageFrame
      title={t("title")}
      description={
        <>
          {t("descriptionLead")}
          <code className={adminChrome.inlineCode}>
            GET /v1/reports/bookings.csv?from=&amp;to=
          </code>
          {t("descriptionTrail")}
        </>
      }
    >
      <AdminReportsSummary data={res.data} locale={locale} />
    </AccountPageFrame>
  );
}
