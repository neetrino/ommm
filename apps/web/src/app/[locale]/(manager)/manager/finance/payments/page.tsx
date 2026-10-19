import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminFinancePaymentsPanel } from "@/components/admin/admin-finance-payments-panel";
import type { FinancePaymentsPayload } from "@/components/admin/admin-finance-types";
import { normalizeFinanceSearch } from "@/components/admin/admin-finance-server-helpers";
import {
  buildFinancePaymentsAdminApiQuery,
  FINANCE_PAYMENTS_PAGE_KEYS,
  parseFinancePaymentsFiltersFromSearch,
} from "@/components/admin/admin-finance-url";
import { FINANCE_PAYMENTS_TODAY_ENDPOINT } from "@/components/admin/admin-finance-url.constants";
import { parseListPageParams } from "@/lib/list-pagination";
import { serverApiJson } from "@/lib/server-api";
import { utcToStudioCalendarDate } from "@/lib/studio-timezone";

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ManagerFinancePaymentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: PageSearchParams;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.dailyFinance" });
  const cookie = (await headers()).get("cookie") ?? "";
  const today = utcToStudioCalendarDate(new Date());
  const paymentsRange = { from: today, to: today };
  const financeFilters = {
    ...parseFinancePaymentsFiltersFromSearch(search),
    from: today,
    to: today,
  };
  const payListPage = parseListPageParams(
    normalizeFinanceSearch(search),
    FINANCE_PAYMENTS_PAGE_KEYS,
  );

  const paymentsRes = await serverApiJson<FinancePaymentsPayload>(
    buildFinancePaymentsAdminApiQuery(
      financeFilters,
      paymentsRange,
      payListPage,
      FINANCE_PAYMENTS_TODAY_ENDPOINT,
    ),
    cookie,
  );

  if (!paymentsRes.ok) {
    const isAuthError = paymentsRes.status === 401 || paymentsRes.status === 403;
    return (
      <div className="app-alert-warn max-w-xl">
        {isAuthError ? t("errorAuth") : t("errorLoad", { status: paymentsRes.status })}
      </div>
    );
  }

  return (
    <AdminFinancePaymentsPanel
      locale={locale}
      initialPayments={paymentsRes.data}
      paymentsRange={paymentsRange}
      financeFilters={financeFilters}
      listEndpoint={FINANCE_PAYMENTS_TODAY_ENDPOINT}
      canSyncArca={false}
      canEditPaidAt={false}
    />
  );
}
