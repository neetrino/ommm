import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { DailyFinanceReport } from "@/components/admin/daily-finance-report";
import {
  DAILY_FINANCE_ENDPOINT,
  type DailyFinanceReportPayload,
} from "@/components/admin/daily-finance-types";
import { formatDateForUi } from "@/lib/date-display";
import { serverApiJson } from "@/lib/server-api";

export default async function ManagerFinanceOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.dailyFinance" });
  const cookie = (await headers()).get("cookie") ?? "";
  const response = await serverApiJson<DailyFinanceReportPayload>(
    DAILY_FINANCE_ENDPOINT,
    cookie,
  );

  if (!response.ok) {
    const isAuthError = response.status === 401 || response.status === 403;
    return (
      <div className="app-alert-warn max-w-xl">
        {isAuthError ? t("errorAuth") : t("errorLoad", { status: response.status })}
      </div>
    );
  }

  return (
    <DailyFinanceReport
      locale={locale}
      dateLabel={formatDateForUi(response.data.date)}
      report={response.data}
    />
  );
}
