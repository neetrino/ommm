import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { formatAmdFromCents } from "@/lib/price-amd";
import { serverApiJson } from "@/lib/server-api";
import { AdminReportsSummary } from "./admin-reports-summary";
import { PaymentsTable } from "./payments-table";
import { ReportsFilters } from "./reports-filters";

type Dashboard = {
  sessionsToday: number;
  bookingsToday: number;
  activeWaitlists: number;
  activeMembers: number;
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

export default async function AdminReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: PageSearchParams;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.reports" });
  const cookie = (await headers()).get("cookie") ?? "";
  const rangeDays = parseRangeDays(search.rangeDays);
  const from = computeFromDate(rangeDays);
  const statusFilter = search.status && search.status !== "all" ? `&status=${search.status}` : "";
  const sourceFilter = search.source && search.source !== "all" ? `&source=${search.source}` : "";

  const [dashboardRes, financeRes, paymentsRes] = await Promise.all([
    serverApiJson<Dashboard>("/reports/dashboard?includeRevenue=true", cookie),
    serverApiJson<FinanceSummary>(
      `/reports/finance/summary?from=${encodeURIComponent(from)}`,
      cookie,
    ),
    serverApiJson<PaymentsResponse>(
      `/payments/admin?from=${encodeURIComponent(from)}${statusFilter}${sourceFilter}`,
      cookie,
    ),
  ]);

  if (!dashboardRes.ok || !financeRes.ok || !paymentsRes.ok) {
    const status = !dashboardRes.ok
      ? dashboardRes.status
      : !financeRes.ok
        ? financeRes.status
        : !paymentsRes.ok
          ? paymentsRes.status
          : 500;
    return (
      <div className="app-alert-warn max-w-xl">
        {status === 401 || status === 403
          ? t("errorAuth")
          : t("errorLoad", { status })}
      </div>
    );
  }

  const failedCount =
    financeRes.data.byStatus.find((entry) => entry.status === "FAILED")?.count ?? 0;

  return (
    <AccountPageFrame
      title={t("title")}
      description={t("description")}
    >
      <ReportsFilters />
      <AdminReportsSummary data={dashboardRes.data} locale={locale} />
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiRevenue")}</p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">
            {formatAmdFromCents(financeRes.data.totals.revenueCents, locale)}
          </p>
        </article>
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiAvgOrderValue")}</p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">
            {formatAmdFromCents(financeRes.data.totals.averageOrderValueCents, locale)}
          </p>
        </article>
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiFailedPayments")}</p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">{failedCount}</p>
        </article>
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
      <div className="mt-6">
        <PaymentsTable items={paymentsRes.data.items} locale={locale} />
      </div>
    </AccountPageFrame>
  );
}
