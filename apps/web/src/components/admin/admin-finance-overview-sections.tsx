import { getTranslations } from "next-intl/server";
import type { FinanceSummaryPayload } from "@/components/admin/admin-finance-server-helpers";
import { getFinanceStatusStats } from "@/components/admin/admin-finance-server-helpers";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminFinanceOverviewSectionsProps = {
  locale: string;
  rangeDays: number;
  totalRevenueCents: number;
  monthRevenueCents: number;
  financeSummary: FinanceSummaryPayload;
};

export async function AdminFinanceOverviewSections({
  locale,
  rangeDays,
  totalRevenueCents,
  monthRevenueCents,
  financeSummary,
}: AdminFinanceOverviewSectionsProps) {
  const t = await getTranslations({ locale, namespace: "adminPages.finance" });
  const pending = getFinanceStatusStats(financeSummary, "PENDING");
  const succeeded = getFinanceStatusStats(financeSummary, "SUCCEEDED");
  const refunded = getFinanceStatusStats(financeSummary, "REFUNDED");

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiTotalRevenue")}</p>
          <p className="mt-0.5 text-[11px] text-sage-500">{t("kpiPeriodAllTime")}</p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">
            {formatAmdFromCents(totalRevenueCents, locale)}
          </p>
        </article>
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiMonthlyRevenue")}</p>
          <p className="mt-0.5 text-[11px] text-sage-500">{t("kpiPeriodThisMonth")}</p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">
            {formatAmdFromCents(monthRevenueCents, locale)}
          </p>
        </article>
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiPendingPayments")}</p>
          <p className="mt-0.5 text-[11px] text-sage-500">{t("kpiPeriodRangeDays", { days: rangeDays })}</p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">{pending.count}</p>
          <p className="mt-1 text-xs text-sage-500">
            {formatAmdFromCents(pending.amountCents, locale)}
          </p>
        </article>
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiCompletedPayments")}</p>
          <p className="mt-0.5 text-[11px] text-sage-500">{t("kpiPeriodRangeDays", { days: rangeDays })}</p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">{succeeded.count}</p>
          <p className="mt-1 text-xs text-sage-500">
            {formatAmdFromCents(succeeded.amountCents, locale)}
          </p>
        </article>
        <article className="ommm-stack-card">
          <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiRefundedPayments")}</p>
          <p className="mt-0.5 text-[11px] text-sage-500">{t("kpiPeriodRangeDays", { days: rangeDays })}</p>
          <p className="mt-2 text-2xl font-semibold text-sage-900">{refunded.count}</p>
          <p className="mt-1 text-xs text-sage-500">
            {formatAmdFromCents(refunded.amountCents, locale)}
          </p>
        </article>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-sage-900">{t("revenueBySource")}</h2>
        <p className="mt-1 text-xs text-sage-500">{t("kpiPeriodRangeDays", { days: rangeDays })}</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(["package", "dropin", "gift", "other"] as const).map((sourceKey) => (
            <article key={sourceKey} className="ommm-stack-card">
              <p className="text-xs uppercase tracking-wide text-sage-500">{t(`sources.${sourceKey}`)}</p>
              <p className="mt-2 text-2xl font-semibold text-sage-900">
                {formatAmdFromCents(financeSummary.bySource[sourceKey].amountCents, locale)}
              </p>
              <p className="mt-1 text-xs text-sage-500">
                {t("transactionsCount", { count: financeSummary.bySource[sourceKey].count })}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-sage-900">{t("giftCreditsHeading")}</h2>
        <p className="mt-1 text-xs text-sage-500">{t("kpiPeriodRangeDays", { days: rangeDays })}</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="ommm-stack-card">
            <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiGiftIssued")}</p>
            <p className="mt-2 text-2xl font-semibold text-sage-900">
              {formatAmdFromCents(financeSummary.giftCredits.issuedCents, locale)}
            </p>
            <p className="mt-1 text-xs text-sage-500">
              {t("transactionsCount", { count: financeSummary.giftCredits.issuedCount })}
            </p>
          </article>
          <article className="ommm-stack-card">
            <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiGiftRedeemed")}</p>
            <p className="mt-2 text-2xl font-semibold text-sage-900">
              {formatAmdFromCents(financeSummary.giftCredits.redeemedCents, locale)}
            </p>
            <p className="mt-1 text-xs text-sage-500">
              {t("transactionsCount", { count: financeSummary.giftCredits.redeemedCount })}
            </p>
          </article>
          <article className="ommm-stack-card">
            <p className="text-xs uppercase tracking-wide text-sage-500">{t("kpiGiftSpent")}</p>
            <p className="mt-2 text-2xl font-semibold text-sage-900">
              {formatAmdFromCents(financeSummary.giftCredits.spentCents, locale)}
            </p>
            <p className="mt-1 text-xs text-sage-500">
              {t("transactionsCount", {
                count: financeSummary.giftCredits.spendTransactionsCount,
              })}
            </p>
          </article>
          <article className="ommm-stack-card">
            <p className="text-xs uppercase tracking-wide text-sage-500">
              {t("kpiGiftOutstandingCredits")}
            </p>
            <p className="mt-2 text-2xl font-semibold text-sage-900">
              {formatAmdFromCents(financeSummary.giftCredits.outstandingCreditsCents, locale)}
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
