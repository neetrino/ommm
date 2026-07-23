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
import {
  buildMemberSegmentItems,
  resolveRangeAttendanceRate,
  sliceSortedBarItems,
} from "@/components/admin/admin-analytics-chart-data";
import { AdminAnalyticsKpiStrip } from "@/components/admin/admin-analytics-kpi-strip";
import { sumBucketValues } from "@/components/admin/admin-analytics-trend-data";
import type { AdminAnalyticsPayload } from "@/components/admin/admin-analytics-types";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminAnalyticsOverviewPanelProps = {
  data: AdminAnalyticsPayload;
};

export function AdminAnalyticsOverviewPanel({ data }: AdminAnalyticsOverviewPanelProps) {
  const t = useTranslations("adminPages.analytics");
  const sortKey = data.sortKey;
  const locale = data.locale;

  const userLabels = useMemo(
    () => ({
      active: t("sections.users.active"),
      vip: t("sections.users.vip"),
    }),
    [t],
  );

  const memberSegments = useMemo(
    () => buildMemberSegmentItems(data, userLabels),
    [data, userLabels],
  );
  const topClasses = useMemo(
    () => sliceSortedBarItems(data.bookings.classPopularity, sortKey, 6),
    [data.bookings.classPopularity, sortKey],
  );
  const trendChartData = useMemo(() => mapDailyTrendForChart(data.dailyTrend), [data.dailyTrend]);
  const rangeAttendanceRate = resolveRangeAttendanceRate(data);
  const revenueTrendTotal = sumBucketValues(data.dailyTrend, "revenueCents");
  const bookingsTrendTotal = sumBucketValues(data.dailyTrend, "total");
  const completedTrendTotal = sumBucketValues(data.dailyTrend, "completed");

  const kpis = [
    {
      key: "revenue",
      label: t("kpiRangeRevenue"),
      value: formatAmdFromCents(data.finance.totals.revenueCents, locale),
    },
    {
      key: "bookings",
      label: t("kpiBookingsInRange"),
      value: String(data.bookings.summary.total),
    },
    {
      key: "attendance",
      label: t("kpiAttendanceRate"),
      value: rangeAttendanceRate === null ? t("notAvailable") : `${rangeAttendanceRate}%`,
    },
    {
      key: "members",
      label: t("kpiActiveMembers"),
      value: String(data.dashboard.activeMembers),
    },
    {
      key: "newUsers",
      label: t("kpiNewUsersToday"),
      value: String(data.dashboard.newUsers?.todayCount ?? 0),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {data.bookings.isSampled ? (
        <p
          className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-xs text-amber-900"
          role="status"
        >
          {t("bookingsSampleBanner", {
            limit: data.bookings.sampledLimit,
            total: data.bookings.matchedTotal,
            shown: data.bookings.sampledRowCount,
          })}
        </p>
      ) : null}
      <AdminAnalyticsKpiStrip items={kpis} />
      <AdminAnalyticsChartPanel title={t("sections.trends.revenueTitle")} hint={t("sections.trends.revenueHint")}>
        <AdminAnalyticsAreaChart
          data={trendChartData}
          xKey="label"
          series={[
            {
              key: "revenue",
              label: t("sections.trends.revenueSeries"),
              color: ANALYTICS_CHART_BLUE,
              totalLabel: formatAmdFromCents(revenueTrendTotal, locale),
            },
          ]}
          emptyLabel={t("empty")}
          ariaLabel={t("sections.trends.revenueChartAria")}
          valueFormatter={(value) => formatAmdFromCents(value, locale)}
        />
      </AdminAnalyticsChartPanel>
      <AdminAnalyticsChartPanel
        title={t("sections.trends.bookingsTitle")}
        hint={t("sections.trends.bookingsHint", { limit: data.bookings.sampledLimit })}
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
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminAnalyticsChartPanel title={t("sections.users.title")} hint={t("sections.users.hint")}>
          <AdminAnalyticsBarList
            items={memberSegments}
            emphasis
            emptyLabel={t("empty")}
            ariaLabel={t("sections.users.chartAria")}
          />
        </AdminAnalyticsChartPanel>
        <AdminAnalyticsChartPanel
          title={t("sections.classPopularity.title")}
          hint={t("sections.classPopularity.hint", { limit: data.bookings.sampledLimit })}
        >
          <AdminAnalyticsBarList
            items={topClasses}
            emphasis
            emptyLabel={t("sections.classPopularity.empty")}
            ariaLabel={t("sections.classPopularity.chartAria")}
          />
        </AdminAnalyticsChartPanel>
      </div>
    </div>
  );
}
