"use client";

import { useTranslations } from "next-intl";
import { AdminAnalyticsKpiStrip } from "@/components/admin/admin-analytics-kpi-strip";
import type { AdminAnalyticsKpiItem } from "@/components/admin/admin-analytics-kpi-strip";
import {
  formatNamedAmount,
  pickTopNamedAmount,
  resolveClassTypeLabel,
} from "@/components/admin/admin-analytics-finance-map";
import type { AdminAnalyticsPayload, StudioAnalyticsPayload } from "@/components/admin/admin-analytics-types";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminAnalyticsRevenueKpisProps = {
  data: AdminAnalyticsPayload;
};

type RevenueKpiCopy = {
  cashRevenue: string;
  previousPeriod: string;
  packageRevenue: string;
  dropinRevenue: string;
  giftOutstanding: string;
  aov: string;
  payments: string;
  topPackage: string;
  topClassType: string;
  topCoach: string;
  topClient: string;
  cashHint: string;
  salesHint: string;
  attributedHint: string;
  empty: string;
  unassigned: string;
};

export function AdminAnalyticsRevenueKpis({ data }: AdminAnalyticsRevenueKpisProps) {
  const t = useTranslations("adminPages.analytics");
  const copy = readRevenueKpiCopy(t);
  return (
    <div className="flex flex-col gap-3">
      <AdminAnalyticsKpiStrip
        items={buildCashKpiItems(data.studio, data.locale, copy, t)}
        trendNotAvailableLabel={t("trendNotAvailable")}
      />
      <AdminAnalyticsKpiStrip
        items={buildRankKpiItems(data.studio, data.locale, copy)}
        trendNotAvailableLabel={t("trendNotAvailable")}
      />
    </div>
  );
}

function readRevenueKpiCopy(t: ReturnType<typeof useTranslations>): RevenueKpiCopy {
  return {
    cashRevenue: t("kpiCashRevenue"),
    previousPeriod: t("comparison.previousPeriod"),
    packageRevenue: t("kpiPackageRevenue"),
    dropinRevenue: t("kpiDropinRevenue"),
    giftOutstanding: t("kpiGiftOutstanding"),
    aov: t("sections.revenue.aov"),
    payments: t("sections.revenue.payments"),
    topPackage: t("kpiTopPackage"),
    topClassType: t("kpiTopClassType"),
    topCoach: t("kpiTopCoach"),
    topClient: t("kpiTopClient"),
    cashHint: t("cashHintShort"),
    salesHint: t("salesHintShort"),
    attributedHint: t("attributedHintShort"),
    empty: t("notAvailable"),
    unassigned: t("unassignedClassType"),
  };
}

function buildCashKpiItems(
  studio: StudioAnalyticsPayload,
  locale: string,
  copy: RevenueKpiCopy,
  t: ReturnType<typeof useTranslations>,
): AdminAnalyticsKpiItem[] {
  const cash = studio.revenue.bySource;
  return [
    {
      key: "total",
      label: copy.cashRevenue,
      value: formatAmdFromCents(studio.kpis.revenueCents, locale),
      deltaPercent: studio.comparison.revenueCents.trendPercent,
      hint: copy.previousPeriod,
    },
    {
      key: "package",
      label: copy.packageRevenue,
      value: formatAmdFromCents(cash.package.amountCents, locale),
      hint: t("kpiPackageUnits", { count: cash.package.count }),
    },
    {
      key: "dropin",
      label: copy.dropinRevenue,
      value: formatAmdFromCents(cash.dropin.amountCents, locale),
    },
    {
      key: "giftOutstanding",
      label: copy.giftOutstanding,
      value: formatAmdFromCents(studio.revenue.giftCredits.outstandingCreditsCents, locale),
    },
    {
      key: "aov",
      label: copy.aov,
      value: formatAmdFromCents(studio.kpis.averageOrderValueCents, locale),
    },
    {
      key: "payments",
      label: copy.payments,
      value: String(studio.kpis.successfulPaymentsCount),
    },
  ];
}

function buildRankKpiItems(
  studio: StudioAnalyticsPayload,
  locale: string,
  copy: RevenueKpiCopy,
): AdminAnalyticsKpiItem[] {
  const topPackage = pickTopNamedAmount(studio.revenue.byPackage);
  const topClass = pickTopNamedAmount(
    studio.revenue.byClassType.map((entry) => ({
      label: resolveClassTypeLabel(entry.id, entry.label, copy.unassigned),
      amountCents: entry.amountCents,
    })),
  );
  const topCoach = pickTopNamedAmount(studio.revenue.byCoach);
  const topClient = pickTopNamedAmount(studio.revenue.topClients);
  return [
    namedKpi("topPackage", copy.topPackage, topPackage, locale, copy.empty, copy.cashHint),
    namedKpi("topClass", copy.topClassType, topClass, locale, copy.empty, copy.salesHint),
    namedKpi("topCoach", copy.topCoach, topCoach, locale, copy.empty, copy.attributedHint),
    namedKpi("topClient", copy.topClient, topClient, locale, copy.empty, copy.cashHint),
  ];
}

function namedKpi(
  key: string,
  label: string,
  row: { label: string; amountCents: number } | null,
  locale: string,
  empty: string,
  hint: string,
): AdminAnalyticsKpiItem {
  return {
    key,
    label,
    value: formatNamedAmount(row, locale, empty),
    hint,
  };
}
