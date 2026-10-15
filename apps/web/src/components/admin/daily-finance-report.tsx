import { getTranslations } from "next-intl/server";
import type {
  DailyFinanceBucket,
  DailyFinanceReportPayload,
} from "@/components/admin/daily-finance-types";
import { formatAmdFromCents } from "@/lib/price-amd";

type DailyFinanceReportProps = {
  locale: string;
  /** Already formatted for UI (`DD.MM.YYYY`). */
  dateLabel: string;
  report: DailyFinanceReportPayload;
};

type KpiCardProps = {
  label: string;
  caption?: string;
  bucket: DailyFinanceBucket;
  locale: string;
  countLabel: string;
};

/** Same card anatomy as the Admin finance overview KPIs. */
function KpiCard({ label, caption, bucket, locale, countLabel }: KpiCardProps) {
  return (
    <article className="ommm-stack-card">
      <p className="text-xs uppercase tracking-wide text-sage-500">{label}</p>
      {caption ? <p className="mt-0.5 text-[11px] text-sage-500">{caption}</p> : null}
      <p className="mt-2 text-2xl font-semibold text-sage-900">
        {formatAmdFromCents(bucket.amountCents, locale)}
      </p>
      <p className="mt-1 text-xs text-sage-500">{countLabel}</p>
    </article>
  );
}

/** Today-only finance snapshot: totals and method split, no payment rows. */
export async function DailyFinanceReport({ locale, dateLabel, report }: DailyFinanceReportProps) {
  const t = await getTranslations({ locale, namespace: "adminPages.dailyFinance" });
  const tFinance = await getTranslations({ locale, namespace: "adminPages.finance" });
  const countLabel = (bucket: DailyFinanceBucket) =>
    tFinance("transactionsCount", { count: bucket.count });

  return (
    <div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label={t("kpiRevenue")}
          caption={dateLabel}
          bucket={report.revenue}
          locale={locale}
          countLabel={countLabel(report.revenue)}
        />
        <KpiCard
          label={tFinance("kpiPendingPayments")}
          caption={dateLabel}
          bucket={report.pending}
          locale={locale}
          countLabel={countLabel(report.pending)}
        />
        <KpiCard
          label={tFinance("kpiRefundedPayments")}
          caption={dateLabel}
          bucket={report.refunded}
          locale={locale}
          countLabel={countLabel(report.refunded)}
        />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-sage-900">{t("byMethodHeading")}</h2>
        <p className="mt-1 text-xs text-sage-500">{dateLabel}</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {report.byMethod.map((bucket) => (
            <KpiCard
              key={bucket.method}
              label={tFinance(`paymentMethods.${bucket.method}`)}
              bucket={bucket}
              locale={locale}
              countLabel={countLabel(bucket)}
            />
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs text-sage-500">{t("scopeNote")}</p>
    </div>
  );
}
