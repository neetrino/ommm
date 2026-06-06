import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AdminFinancePaymentsFilters } from "@/components/admin/admin-finance-payments-filters";
import { AdminFinancePaymentsPanel } from "@/components/admin/admin-finance-payments-panel";
import { computeFinanceFromDate } from "@/components/admin/admin-finance-dates";
import type { FinancePaymentsPayload } from "@/components/admin/admin-finance-types";
import { normalizeFinanceSearch } from "@/components/admin/admin-finance-server-helpers";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import {
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
  const normalizedSearch = normalizeFinanceSearch(search);
  const t = await getTranslations({ locale, namespace: "adminPages.finance" });
  const cookie = (await headers()).get("cookie") ?? "";
  const financeFilters = parseFinancePaymentsFiltersFromSearch(search);
  const payListPage = parseListPageParams(normalizedSearch, FINANCE_PAYMENTS_PAGE_KEYS);
  const from = computeFinanceFromDate(financeFilters.rangeDays);
  const statusFilter =
    financeFilters.status !== "all" ? `&status=${financeFilters.status}` : "";
  const sourceFilter =
    financeFilters.source !== "all" ? `&source=${financeFilters.source}` : "";
  const queryFilter =
    financeFilters.q.trim() !== ""
      ? `&q=${encodeURIComponent(financeFilters.q.trim())}`
      : "";

  const paymentsRes = await serverApiJson<FinancePaymentsPayload>(
    `/payments/admin?from=${encodeURIComponent(from)}${statusFilter}${sourceFilter}${queryFilter}&take=${payListPage.take}&offset=${payListPage.offset}`,
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
    <AdminSectionShell>
      <Suspense fallback={null}>
        <AdminFinancePaymentsFilters
          key={`${financeFilters.q}|${financeFilters.rangeDays}|${financeFilters.source}|${financeFilters.status}`}
          initialValues={financeFilters}
        />
      </Suspense>
      <AdminFinancePaymentsPanel
        locale={locale}
        initialPayments={paymentsRes.data}
        paymentsFrom={from}
        paymentsStatus={financeFilters.status}
        paymentsSource={financeFilters.source}
        searchQuery={financeFilters.q}
      />
    </AdminSectionShell>
  );
}
