import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminFinanceOverviewSections } from "@/components/admin/admin-finance-overview-sections";
import {
  buildFinanceDateRangeQuery,
  resolveFinanceCurrentMonthRange,
  resolveFinancePaymentsDateRange,
  resolveFinanceStudioDateRange,
} from "@/components/admin/admin-finance-dates";
import { DEFAULT_FINANCE_OVERVIEW_RANGE } from "@/components/admin/admin-finance-types";
import {
  redirectIfUnscopedFinanceSearchParams,
  type FinanceSummaryPayload,
} from "@/components/admin/admin-finance-server-helpers";
import { parseFinanceOverviewFiltersFromSearch } from "@/components/admin/admin-finance-url";
import { serverApiJson } from "@/lib/server-api";

type Dashboard = {
  revenueCentsTotal?: number;
};

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

function resolveOverviewQueryRange(from: string, to: string) {
  const custom = resolveFinancePaymentsDateRange(from, to);
  if (custom.from || custom.to) {
    return {
      from: custom.from ?? custom.to ?? "",
      to: custom.to ?? custom.from ?? "",
    };
  }
  return resolveFinanceStudioDateRange(DEFAULT_FINANCE_OVERVIEW_RANGE);
}

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
  const range = resolveOverviewQueryRange(overviewFilters.from, overviewFilters.to);
  const rangeQuery = buildFinanceDateRangeQuery(range);
  const monthQuery = buildFinanceDateRangeQuery(resolveFinanceCurrentMonthRange());

  const [dashboardRes, financeRes, monthFinanceRes] = await Promise.all([
    serverApiJson<Dashboard>("/reports/dashboard?includeRevenue=true", cookie),
    serverApiJson<FinanceSummaryPayload>(
      `/reports/finance/summary?${rangeQuery}`,
      cookie,
    ),
    serverApiJson<FinanceSummaryPayload>(
      `/reports/finance/summary?${monthQuery}`,
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
    <AdminFinanceOverviewSections
      locale={locale}
      periodFrom={range.from}
      periodTo={range.to}
      totalRevenueCents={dashboardRes.data.revenueCentsTotal ?? 0}
      monthRevenueCents={monthFinanceRes.data.totals.revenueCents}
      financeSummary={financeRes.data}
    />
  );
}
