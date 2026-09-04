import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminFinancePaymentsPanel } from "@/components/admin/admin-finance-payments-panel";
import { resolveFinancePaymentsDateRange } from "@/components/admin/admin-finance-dates";
import type { FinancePaymentsPayload } from "@/components/admin/admin-finance-types";
import { normalizeFinanceSearch, redirectIfUnscopedFinanceSearchParams } from "@/components/admin/admin-finance-server-helpers";
import {
  buildFinancePaymentsAdminApiQuery,
  FINANCE_PAYMENTS_PAGE_KEYS,
  parseFinancePaymentsFiltersFromSearch,
} from "@/components/admin/admin-finance-url";
import { parseListPageParams } from "@/lib/list-pagination";
import { serverApiJson } from "@/lib/server-api";

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminFinancePaymentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: PageSearchParams;
}) {
  const { locale } = await params;
  const search = await searchParams;
  redirectIfUnscopedFinanceSearchParams(locale, "payments", search);
  const normalizedSearch = normalizeFinanceSearch(search);
  const t = await getTranslations({ locale, namespace: "adminPages.finance" });
  const cookie = (await headers()).get("cookie") ?? "";
  const financeFilters = parseFinancePaymentsFiltersFromSearch(search);
  const payListPage = parseListPageParams(normalizedSearch, FINANCE_PAYMENTS_PAGE_KEYS);
  const paymentsRange = resolveFinancePaymentsDateRange(financeFilters.from, financeFilters.to);

  const paymentsRes = await serverApiJson<FinancePaymentsPayload>(
    buildFinancePaymentsAdminApiQuery(financeFilters, paymentsRange, payListPage),
    cookie,
  );

  if (!paymentsRes.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {paymentsRes.status === 401 || paymentsRes.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: paymentsRes.status })}
      </div>
    );
  }

  return (
    <AdminFinancePaymentsPanel
      locale={locale}
      initialPayments={paymentsRes.data}
      paymentsRange={paymentsRange}
      financeFilters={financeFilters}
    />
  );
}
