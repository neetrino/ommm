"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminAnalyticsAreaChart } from "@/components/admin/admin-analytics-area-chart";
import {
  ANALYTICS_CHART_BLUE,
  ANALYTICS_CHART_INK,
  mapDailyTrendForChart,
} from "@/components/admin/admin-analytics-area-chart-config";
import { AdminAnalyticsBarList } from "@/components/admin/admin-analytics-bar-list";
import { AdminAnalyticsChartPanel } from "@/components/admin/admin-analytics-chart-panel";
import { AdminAnalyticsColumnChart } from "@/components/admin/admin-analytics-column-chart";
import { AdminAnalyticsKpiStrip } from "@/components/admin/admin-analytics-kpi-strip";
import { AdminAnalyticsPanelSection } from "@/components/admin/admin-analytics-panel-motion";
import {
  buildClassPopularityBarItems,
  buildWaitlistSnapshotItems,
  formatRatePercent,
} from "@/components/admin/admin-analytics-studio-map";
import { sliceSortedBarItems } from "@/components/admin/admin-analytics-chart-data";
import { sumBucketValues } from "@/components/admin/admin-analytics-trend-data";
import type { AdminAnalyticsPayload } from "@/components/admin/admin-analytics-types";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminAnalyticsOverviewPanelProps = {
  data: AdminAnalyticsPayload;
};

export function AdminAnalyticsOverviewPanel({ data }: AdminAnalyticsOverviewPanelProps) {
  const t = useTranslations("adminPages.analytics");
  const studio = data.studio;
  const sortKey = data.sortKey;
  const locale = data.locale;

  const topClasses = useMemo(
    () => sliceSortedBarItems(buildClassPopularityBarItems(studio, sortKey), sortKey, 6),
    [sortKey, studio],
  );
  const waitlistItems = useMemo(
    () =>
      buildWaitlistSnapshotItems(
        studio,
        {
          active: t("sections.waitlist.active"),
          offered: t("sections.waitlist.offered"),
          converted: t("sections.waitlist.converted"),
          conversionRate: t("sections.waitlist.conversionRate"),
        },
        t("notAvailable"),
      ),
    [studio, t],
  );
  const trendChartData = useMemo(() => mapDailyTrendForChart(data.dailyTrend), [data.dailyTrend]);
  const revenueTrendTotal = sumBucketValues(data.dailyTrend, "revenueCents");
  const bookingsTrendTotal = sumBucketValues(data.dailyTrend, "total");
  const completedTrendTotal = sumBucketValues(data.dailyTrend, "completed");
  const occupancyTrendAvg = sumBucketValues(data.dailyTrend, "occupancyRate");

  const kpis = [
    {
      key: "revenue",
      label: t("kpiCashRevenue"),
      value: formatAmdFromCents(studio.kpis.revenueCents, locale),
      deltaPercent: studio.comparison.revenueCents.trendPercent,
      hint: t("comparison.previousPeriod"),
    },
    {
      key: "bookings",
      label: t("kpiBookingsInRange"),
      value: String(studio.kpis.bookingsTotal),
      deltaPercent: studio.comparison.bookings.trendPercent,
      hint: t("comparison.previousPeriod"),
    },
    {
      key: "attendance",
      label: t("kpiAttendanceRate"),
      value: formatRatePercent(studio.kpis.attendanceRate, t("notAvailable")),
      deltaPercent: studio.comparison.attendanceRate.trendPercent,
      hint: t("comparison.previousPeriod"),
    },
    {
      key: "occupancy",
      label: t("kpiOccupancyRate"),
      value: formatRatePercent(studio.kpis.occupancyRate, t("notAvailable")),
      deltaPercent: studio.comparison.occupancyRate.trendPercent,
      hint: t("comparison.previousPeriod"),
    },
    {
      key: "newMembers",
      label: t("kpiNewMembers"),
      value: String(studio.kpis.newMembers),
      deltaPercent: studio.comparison.newMembers.trendPercent,
      hint: t("comparison.previousPeriod"),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminAnalyticsPanelSection index={0}>
        <AdminAnalyticsKpiStrip items={kpis} trendNotAvailableLabel={t("trendNotAvailable")} />
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
                totalLabel: formatAmdFromCents(revenueTrendTotal, locale),
              },
            ]}
            emptyLabel={t("empty")}
            ariaLabel={t("sections.trends.revenueChartAria")}
            valueFormatter={(value) => formatAmdFromCents(value, locale)}
          />
        </AdminAnalyticsChartPanel>
      </AdminAnalyticsPanelSection>
      <AdminAnalyticsPanelSection index={2}>
        <AdminAnalyticsChartPanel
          title={t("sections.trends.bookingsTitle")}
          hint={t("sections.trends.bookingsHint")}
        >
          <AdminAnalyticsAreaChart
            data={trendChartData}
            xKey="label"
            series={[
              {
                key: "bookings",
                label: t("sections.trends.bookingsSeries"),
                color: ANALYTICS_CHART_BLUE,
                totalLabel: String(bookingsTrendTotal),
              },
              {
                key: "completed",
                label: t("sections.trends.completedSeries"),
                color: ANALYTICS_CHART_INK,
                totalLabel: String(completedTrendTotal),
              },
            ]}
            emptyLabel={t("empty")}
            ariaLabel={t("sections.trends.bookingsChartAria")}
          />
        </AdminAnalyticsChartPanel>
      </AdminAnalyticsPanelSection>
      <AdminAnalyticsPanelSection index={3}>
        <AdminAnalyticsChartPanel
          title={t("sections.occupancy.dailyTitle")}
          hint={t("sections.occupancy.dailyHint")}
        >
          <AdminAnalyticsColumnChart
            data={trendChartData}
            xKey="label"
            series={[
              {
                key: "occupancy",
                label: t("sections.occupancy.series"),
                color: ANALYTICS_CHART_BLUE,
                totalLabel: `${occupancyTrendAvg}%`,
              },
            ]}
            emptyLabel={t("empty")}
            ariaLabel={t("sections.occupancy.chartAria")}
            valueFormatter={(value) => `${value}%`}
            yMax={100}
          />
        </AdminAnalyticsChartPanel>
      </AdminAnalyticsPanelSection>
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminAnalyticsPanelSection index={4}>
          <AdminAnalyticsChartPanel
            title={t("sections.classPopularity.title")}
            hint={t("sections.classPopularity.hint")}
          >
            <AdminAnalyticsBarList
              items={topClasses}
              emphasis
              emptyLabel={t("sections.classPopularity.empty")}
              ariaLabel={t("sections.classPopularity.chartAria")}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
        <AdminAnalyticsPanelSection index={5}>
          <AdminAnalyticsChartPanel
            title={t("sections.waitlist.title")}
            hint={t("sections.waitlist.hint")}
          >
            <AdminAnalyticsBarList
              items={waitlistItems}
              emphasis
              emptyLabel={t("empty")}
              ariaLabel={t("sections.waitlist.chartAria")}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
      </div>
    </div>
  );
}
