"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminAnalyticsBarList } from "@/components/admin/admin-analytics-bar-list";
import { AdminAnalyticsChartPanel } from "@/components/admin/admin-analytics-chart-panel";
import {
  buildPaymentStatusItems,
  buildRevenueSourceItems,
} from "@/components/admin/admin-analytics-chart-data";
import { AdminAnalyticsDonutChart } from "@/components/admin/admin-analytics-donut-chart";
import { AdminAnalyticsKpiStrip } from "@/components/admin/admin-analytics-kpi-strip";
import type { AdminAnalyticsPayload } from "@/components/admin/admin-analytics-types";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminAnalyticsRevenuePanelProps = {
  data: AdminAnalyticsPayload;
};

export function AdminAnalyticsRevenuePanel({ data }: AdminAnalyticsRevenuePanelProps) {
  const t = useTranslations("adminPages.analytics");
  const sortKey = data.sortKey;
  const locale = data.locale;

  const sourceLabels = useMemo(
    () => ({
      package: t("sources.package"),
      dropin: t("sources.dropin"),
      gift: t("sources.gift"),
      other: t("sources.other"),
    }),
    [t],
  );

  const revenueSourceItems = useMemo(
    () => buildRevenueSourceItems(data, sortKey, sourceLabels),
    [data, sortKey, sourceLabels],
  );
  const paymentStatusItems = useMemo(
    () => buildPaymentStatusItems(data, sortKey),
    [data, sortKey],
  );

  const kpis = [
    {
      key: "total",
      label: t("sections.revenue.total"),
      value: formatAmdFromCents(data.finance.totals.revenueCents, locale),
    },
    {
      key: "payments",
      label: t("sections.revenue.payments"),
      value: String(data.finance.totals.successfulPaymentsCount),
    },
    {
      key: "aov",
      label: t("sections.revenue.aov"),
      value: formatAmdFromCents(data.finance.totals.averageOrderValueCents, locale),
    },
    {
      key: "month",
      label: t("sections.revenue.month"),
      value: formatAmdFromCents(data.dashboard.revenue?.monthRevenueCents ?? 0, locale),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminAnalyticsKpiStrip items={kpis} />
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminAnalyticsChartPanel title={t("sections.revenue.title")} hint={t("sections.revenue.hint")}>
          <AdminAnalyticsDonutChart
            items={revenueSourceItems}
            emptyLabel={t("empty")}
            ariaLabel={t("sections.revenue.chartAria")}
          />
        </AdminAnalyticsChartPanel>
        <AdminAnalyticsChartPanel title={t("sections.paymentStatus.title")}>
          <AdminAnalyticsBarList
            items={paymentStatusItems}
            emphasis
            emptyLabel={t("empty")}
            ariaLabel={t("sections.paymentStatus.chartAria")}
          />
        </AdminAnalyticsChartPanel>
      </div>
    </div>
  );
}
