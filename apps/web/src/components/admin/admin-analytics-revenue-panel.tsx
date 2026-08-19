"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminAnalyticsAreaChart } from "@/components/admin/admin-analytics-area-chart";
import {
  ANALYTICS_CHART_BLUE,
  mapDailyTrendForChart,
} from "@/components/admin/admin-analytics-area-chart-config";
import { AdminAnalyticsChartPanel } from "@/components/admin/admin-analytics-chart-panel";
import { AdminAnalyticsKpiStrip } from "@/components/admin/admin-analytics-kpi-strip";
import { AdminAnalyticsPanelSection } from "@/components/admin/admin-analytics-panel-motion";
import { AdminAnalyticsRevenueCharts } from "@/components/admin/admin-analytics-revenue-charts";
import { AdminAnalyticsRevenueKpis } from "@/components/admin/admin-analytics-revenue-kpis";
import { AdminAnalyticsRevenueRankings } from "@/components/admin/admin-analytics-revenue-rankings";
import { sumBucketValues } from "@/components/admin/admin-analytics-trend-data";
import type { AdminAnalyticsPayload } from "@/components/admin/admin-analytics-types";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminAnalyticsRevenuePanelProps = {
  data: AdminAnalyticsPayload;
};

export function AdminAnalyticsRevenuePanel({ data }: AdminAnalyticsRevenuePanelProps) {
  const t = useTranslations("adminPages.analytics");
  const gift = data.studio.revenue.giftCredits;
  const trendChartData = useMemo(() => mapDailyTrendForChart(data.dailyTrend), [data.dailyTrend]);
  const revenueTrendTotal = sumBucketValues(data.dailyTrend, "revenueCents");

  return (
    <div className="flex flex-col gap-6">
      <AdminAnalyticsPanelSection index={0}>
        <AdminAnalyticsRevenueKpis data={data} />
      </AdminAnalyticsPanelSection>
      <AdminAnalyticsPanelSection index={1}>
        <AdminAnalyticsChartPanel
          title={t("sections.trends.revenueTitle")}
          hint={t("sections.trends.cashRevenueHint")}
        >
          <AdminAnalyticsAreaChart
            data={trendChartData}
            xKey="label"
            series={[
              {
                key: "revenue",
                label: t("sections.trends.cashRevenueSeries"),
                color: ANALYTICS_CHART_BLUE,
                totalLabel: formatAmdFromCents(revenueTrendTotal, data.locale),
              },
            ]}
            emptyLabel={t("empty")}
            ariaLabel={t("sections.trends.revenueChartAria")}
            valueFormatter={(value) => formatAmdFromCents(value, data.locale)}
          />
        </AdminAnalyticsChartPanel>
      </AdminAnalyticsPanelSection>
      <AdminAnalyticsRevenueCharts data={data} />
      <AdminAnalyticsRevenueRankings data={data} />
      <AdminAnalyticsPanelSection index={9}>
        <AdminAnalyticsChartPanel title={t("sections.giftCredits.title")} hint={t("sections.giftCredits.hint")}>
          <AdminAnalyticsKpiStrip items={buildGiftKpis(gift, data.locale, t)} />
        </AdminAnalyticsChartPanel>
      </AdminAnalyticsPanelSection>
    </div>
  );
}

function buildGiftKpis(
  gift: AdminAnalyticsPayload["studio"]["revenue"]["giftCredits"],
  locale: string,
  t: ReturnType<typeof useTranslations>,
) {
  return [
    {
      key: "issued",
      label: t("sections.giftCredits.issued"),
      value: formatAmdFromCents(gift.issuedCents, locale),
    },
    {
      key: "redeemed",
      label: t("sections.giftCredits.redeemed"),
      value: formatAmdFromCents(gift.redeemedCents, locale),
    },
    {
      key: "spent",
      label: t("sections.giftCredits.spent"),
      value: formatAmdFromCents(gift.spentCents, locale),
    },
    {
      key: "outstanding",
      label: t("sections.giftCredits.outstanding"),
      value: formatAmdFromCents(gift.outstandingCreditsCents, locale),
    },
  ];
}
