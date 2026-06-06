import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminFinanceOverviewSections } from "@/components/admin/admin-finance-overview-sections";
import { computeFinanceFromDate, computeFinanceMonthStart } from "@/components/admin/admin-finance-dates";
import {
  redirectIfUnscopedFinanceSearchParams,
  type FinanceSummaryPayload,
} from "@/components/admin/admin-finance-server-helpers";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { parseFinanceOverviewFiltersFromSearch } from "@/components/admin/admin-finance-url";
import { serverApiJson } from "@/lib/server-api";

type Dashboard = {
  revenueCentsTotal?: number;
};

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminFinanceOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: PageSearchParams;
}) {
  const { locale } = await params;
  const search = await searchParams;
  redirectIfUnscopedFinanceSearchParams(locale, "overview", search);
  const t = await getTranslations({ locale, namespace: "adminPages.finance" });
  const cookie = (await headers()).get("cookie") ?? "";
  const overviewFilters = parseFinanceOverviewFiltersFromSearch(search);
  const rangeDays = overviewFilters.rangeDays;
  const from = computeFinanceFromDate(rangeDays);
  const monthFrom = computeFinanceMonthStart();

  const [dashboardRes, financeRes, monthFinanceRes] = await Promise.all([
    serverApiJson<Dashboard>("/reports/dashboard?includeRevenue=true", cookie),
    serverApiJson<FinanceSummaryPayload>(
      `/reports/finance/summary?from=${encodeURIComponent(from)}`,
      cookie,
    ),
    serverApiJson<FinanceSummaryPayload>(
      `/reports/finance/summary?from=${encodeURIComponent(monthFrom)}`,
      cookie,
    ),
  ]);

  if (!dashboardRes.ok || !financeRes.ok || !monthFinanceRes.ok) {
    const status = !dashboardRes.ok
      ? dashboardRes.status
      : !financeRes.ok
        ? financeRes.status
        : !monthFinanceRes.ok
          ? monthFinanceRes.status
          : 500;
    return (
      <div className="app-alert-warn max-w-xl">
        {status === 401 || status === 403 ? t("errorAuth") : t("errorLoad", { status })}
      </div>
    );
  }

  return (
    <AdminSectionShell>
      <AdminFinanceOverviewSections
        locale={locale}
        rangeDays={rangeDays}
        totalRevenueCents={dashboardRes.data.revenueCentsTotal ?? 0}
        monthRevenueCents={monthFinanceRes.data.totals.revenueCents}
        financeSummary={financeRes.data}
      />
    </AdminSectionShell>
  );
}
