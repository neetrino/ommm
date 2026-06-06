"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AdminAnalyticsAreaChart } from "@/components/admin/admin-analytics-area-chart";
import {
  ANALYTICS_CHART_BLUE,
  ANALYTICS_CHART_INK,
  mapDailyTrendForChart,
} from "@/components/admin/admin-analytics-area-chart-config";
import { AdminAnalyticsChartPanel } from "@/components/admin/admin-analytics-chart-panel";
import { AdminAnalyticsDonutChart } from "@/components/admin/admin-analytics-donut-chart";
import type { AnalyticsBarItem, AnalyticsDailyBucket } from "@/components/admin/admin-analytics-types";
import { sumBucketValues } from "@/components/admin/admin-analytics-trend-data";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminDashboardChartsProps = {
  locale: string;
  dailyTrend: AnalyticsDailyBucket[];
  todayBookingsItems: readonly AnalyticsBarItem[];
};

export function AdminDashboardCharts({
  locale,
  dailyTrend,
  todayBookingsItems,
}: AdminDashboardChartsProps) {
  const t = useTranslations("adminHome.overview.charts");

  const trendChartData = useMemo(() => mapDailyTrendForChart(dailyTrend), [dailyTrend]);
  const revenueTrendTotal = sumBucketValues(dailyTrend, "revenueCents");
  const bookingsTrendTotal = sumBucketValues(dailyTrend, "total");
  const completedTrendTotal = sumBucketValues(dailyTrend, "completed");

  return (
    <div className="flex flex-col gap-4">
      <AdminAnalyticsChartPanel title={t("revenueTitle")} hint={t("revenueHint")}>
        <AdminAnalyticsAreaChart
          data={trendChartData}
          xKey="label"
          series={[
            {
              key: "revenue",
              label: t("revenueSeries"),
              color: ANALYTICS_CHART_BLUE,
              totalLabel: formatAmdFromCents(revenueTrendTotal, locale),
            },
          ]}
          emptyLabel={t("empty")}
          ariaLabel={t("revenueChartAria")}
          valueFormatter={(value) => formatAmdFromCents(value, locale)}
          chartClassName="h-[220px] sm:h-[240px]"
        />
      </AdminAnalyticsChartPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminAnalyticsChartPanel title={t("bookingsTitle")} hint={t("bookingsHint")}>
          <AdminAnalyticsAreaChart
            data={trendChartData}
            xKey="label"
            series={[
              {
                key: "bookings",
                label: t("bookingsSeries"),
                color: ANALYTICS_CHART_BLUE,
                totalLabel: String(bookingsTrendTotal),
              },
              {
                key: "completed",
                label: t("completedSeries"),
                color: ANALYTICS_CHART_INK,
                totalLabel: String(completedTrendTotal),
              },
            ]}
            emptyLabel={t("empty")}
            ariaLabel={t("bookingsChartAria")}
            chartClassName="h-[200px] sm:h-[220px]"
          />
        </AdminAnalyticsChartPanel>

        <AdminAnalyticsChartPanel title={t("todayBookingsTitle")}>
          <AdminAnalyticsDonutChart
            items={todayBookingsItems}
            emptyLabel={t("empty")}
            ariaLabel={t("todayBookingsAria")}
          />
          <Link
            href="/admin/analytics/overview"
            className="mt-4 inline-flex text-xs font-medium text-sage-600 underline-offset-4 transition hover:text-sage-900 hover:underline"
          >
            {t("viewAnalytics")}
          </Link>
        </AdminAnalyticsChartPanel>
      </div>
    </div>
  );
}
