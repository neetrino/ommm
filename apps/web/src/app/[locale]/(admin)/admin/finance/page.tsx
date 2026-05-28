import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { formatAmdFromCents } from "@/lib/price-amd";
import { serverApiJson } from "@/lib/server-api";
import { FinanceFilters } from "./finance-filters";
import { FinancePaymentsTable } from "./finance-payments-table";

type Dashboard = {
  revenueCentsTotal?: number;
};

type FinanceSummary = {
  totals: {
    revenueCents: number;
    successfulPaymentsCount: number;
    averageOrderValueCents: number;
  };
  byStatus: Array<{
    status: string;
    count: number;
    amountCents: number;
  }>;
  bySource: Record<"membership" | "dropin" | "gift" | "other", { count: number; amountCents: number }>;
  giftCredits: {
    issuedCents: number;
    issuedCount: number;
    redeemedCents: number;
    redeemedCount: number;
    spentCents: number;
    spendTransactionsCount: number;
    outstandingCreditsCents: number;
  };
};

type PaymentsResponse = {
  items: Array<{
    id: string;
    amountCents: number;
    currency: string;
    status: string;
    description: string | null;
    source: "membership" | "dropin" | "gift" | "other";
    createdAt: string;
    user: {
      email: string;
      name: string | null;
      lastName: string | null;
    };
  }>;
  total: number;
  take: number;
  offset: number;
};

type PageSearchParams = Promise<{
  rangeDays?: string;
  source?: string;
  status?: string;
  q?: string;
}>;

function parseRangeDays(value?: string): number {
  const parsed = Number(value);
  if (parsed === 7 || parsed === 30 || parsed === 90) {
    return parsed;
  }
  return 30;
}

function computeFromDate(days: number): string {
  const from = new Date();
  from.setDate(from.getDate() - days + 1);
  from.setHours(0, 0, 0, 0);
  return from.toISOString();
}

function computeMonthStart(): string {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return start.toISOString();
}

function getStatusStats(summary: FinanceSummary, status: string) {
  return summary.byStatus.find((entry) => entry.status === status) ?? { status, count: 0, amountCents: 0 };
}

function filterPaymentsByQuery(items: PaymentsResponse["items"], query: string) {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) {
    return items;
  }

  return items.filter((item) => {
    const fullName = `${item.user.name ?? ""} ${item.user.lastName ?? ""}`.toLowerCase();
    const haystack = [
      item.id,
      item.user.email,
      fullName,
      item.description ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export default async function AdminFinancePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: PageSearchParams;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.finance" });
  const cookie = (await headers()).get("cookie") ?? "";
  const rangeDays = parseRangeDays(search.rangeDays);
  const from = computeFromDate(rangeDays);
  const monthFrom = computeMonthStart();
  const statusFilter = search.status && search.status !== "all" ? `&status=${search.status}` : "";
  const sourceFilter = search.source && search.source !== "all" ? `&source=${search.source}` : "";

  const [dashboardRes, financeRes, monthFinanceRes, paymentsRes] = await Promise.all([
    serverApiJson<Dashboard>("/reports/dashboard?includeRevenue=true", cookie),
    serverApiJson<FinanceSummary>(
      `/reports/finance/summary?from=${encodeURIComponent(from)}`,
      cookie,
    ),
    serverApiJson<FinanceSummary>(
      `/reports/finance/summary?from=${encodeURIComponent(monthFrom)}`,
      cookie,
    ),
    serverApiJson<PaymentsResponse>(
      `/payments/admin?from=${encodeURIComponent(from)}${statusFilter}${sourceFilter}&take=100`,
      cookie,
    ),
  ]);

  if (!dashboardRes.ok || !financeRes.ok || !monthFinanceRes.ok || !paymentsRes.ok) {
    const status = !dashboardRes.ok
      ? dashboardRes.status
      : !financeRes.ok
        ? financeRes.status
        : !monthFinanceRes.ok
          ? monthFinanceRes.status
          : !paymentsRes.ok
            ? paymentsRes.status
            : 500;
    return (
      <div className="app-alert-warn max-w-xl">
        {status === 401 || status === 403 ? t("errorAuth") : t("errorLoad", { status })}
      </div>
    );
  }

  const pending = getStatusStats(financeRes.data, "PENDING");
  const succeeded = getStatusStats(financeRes.data, "SUCCEEDED");
  const refunded = getStatusStats(financeRes.data, "REFUNDED");
  const filteredPayments = filterPaymentsByQuery(paymentsRes.data.items, search.q ?? "");

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <FinanceFilters />

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiTotalRevenue")}</p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">
            {formatAmdFromCents(dashboardRes.data.revenueCentsTotal ?? 0, locale)}
          </p>
        </article>
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiMonthlyRevenue")}</p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">
            {formatAmdFromCents(monthFinanceRes.data.totals.revenueCents, locale)}
          </p>
        </article>
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiPendingPayments")}</p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">{pending.count}</p>
          <p className="mt-1 text-xs text-sage-500">
            {formatAmdFromCents(pending.amountCents, locale)}
          </p>
        </article>
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiCompletedPayments")}</p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">{succeeded.count}</p>
          <p className="mt-1 text-xs text-sage-500">
            {formatAmdFromCents(succeeded.amountCents, locale)}
          </p>
        </article>
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiRefundedPayments")}</p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">{refunded.count}</p>
          <p className="mt-1 text-xs text-sage-500">
            {formatAmdFromCents(refunded.amountCents, locale)}
          </p>
        </article>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-sage-900">{t("revenueBySource")}</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(["membership", "dropin", "gift", "other"] as const).map((sourceKey) => (
            <article key={sourceKey} className="ommm-stack-card">
              <p className="text-xs uppercase tracking-wide text-sage-500">{t(`sources.${sourceKey}`)}</p>
              <p className="mt-2 text-2xl font-semibold text-sage-900">
                {formatAmdFromCents(financeRes.data.bySource[sourceKey].amountCents, locale)}
              </p>
              <p className="mt-1 text-xs text-sage-500">
                {t("transactionsCount", { count: financeRes.data.bySource[sourceKey].count })}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-sage-900">{t("giftCreditsHeading")}</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="ommm-stack-card">
            <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiGiftIssued")}</p>
            <p className="mt-2 text-2xl font-semibold text-sage-900">
              {formatAmdFromCents(financeRes.data.giftCredits.issuedCents, locale)}
            </p>
            <p className="mt-1 text-xs text-sage-500">
              {t("transactionsCount", { count: financeRes.data.giftCredits.issuedCount })}
            </p>
          </article>
          <article className="ommm-stack-card">
            <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiGiftRedeemed")}</p>
            <p className="mt-2 text-2xl font-semibold text-sage-900">
              {formatAmdFromCents(financeRes.data.giftCredits.redeemedCents, locale)}
            </p>
            <p className="mt-1 text-xs text-sage-500">
              {t("transactionsCount", { count: financeRes.data.giftCredits.redeemedCount })}
            </p>
          </article>
          <article className="ommm-stack-card">
            <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiGiftSpent")}</p>
            <p className="mt-2 text-2xl font-semibold text-sage-900">
              {formatAmdFromCents(financeRes.data.giftCredits.spentCents, locale)}
            </p>
            <p className="mt-1 text-xs text-sage-500">
              {t("transactionsCount", {
                count: financeRes.data.giftCredits.spendTransactionsCount,
              })}
            </p>
          </article>
          <article className="ommm-stack-card">
            <p className="text-xs uppercase tracking-wide text-sage-500">
              {t("kpiGiftOutstandingCredits")}
            </p>
            <p className="mt-2 text-2xl font-semibold text-sage-900">
              {formatAmdFromCents(financeRes.data.giftCredits.outstandingCreditsCents, locale)}
            </p>
          </article>
        </div>
      </section>

      <section className="mt-8 rounded-[20px] border border-white/60 bg-white/70 p-4 text-sm text-sage-700">
        <p className="font-medium text-sage-900">{t("exportHeading")}</p>
        <p className="mt-2 text-xs text-sage-600">{t("exportHint")}</p>
        <a
          className="mt-3 inline-flex rounded-xl border border-sage-300 bg-white px-3 py-2 text-xs font-medium text-sage-700"
          href={`/api/v1/reports/payments.csv?from=${encodeURIComponent(from)}`}
        >
          {t("exportPaymentsCsv")}
        </a>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-sage-900">{t("recentTransactions")}</h2>
        <p className="mt-1 text-xs text-sage-500">
          {t("shownCount", { shown: filteredPayments.length, total: paymentsRes.data.total })}
        </p>
        <div className="mt-3">
          <FinancePaymentsTable items={filteredPayments} locale={locale} />
        </div>
      </section>
    </AccountPageFrame>
  );
}
