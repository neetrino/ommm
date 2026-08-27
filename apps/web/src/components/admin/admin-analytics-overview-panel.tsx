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
  formatNamedAmount,
  pickTopNamedAmount,
  resolveClassTypeLabel,
} from "@/components/admin/admin-analytics-finance-map";
import {
  buildClassPopularityBarItems,
  buildWaitlistSnapshotItems,
  formatRatePercent,
} from "@/components/admin/admin-analytics-studio-map";
import { sliceSortedBarItems } from "@/components/admin/admin-analytics-chart-data";
import { AnalyticsRankTable } from "@/components/admin/admin-analytics-shared-ui";
import { sumBucketValues } from "@/components/admin/admin-analytics-trend-data";
import type { AdminAnalyticsPayload } from "@/components/admin/admin-analytics-types";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminAnalyticsOverviewPanelProps = {
  data: AdminAnalyticsPayload;
  includeFinance?: boolean;
};

export function AdminAnalyticsOverviewPanel({
  data,
  includeFinance = true,
}: AdminAnalyticsOverviewPanelProps) {
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
  const unassigned = t("unassignedClassType");
  const financeTeaser = useMemo(
    () =>
      buildFinanceTeaserRows(studio, locale, unassigned, t("notAvailable"), {
        package: t("sections.financeRankings.package"),
        classType: t("sections.financeRankings.classType"),
        coach: t("sections.financeRankings.coach"),
      }),
    [locale, studio, t, unassigned],
  );

  const kpis = [
    ...(includeFinance
      ? [
          {
            key: "revenue",
            label: t("kpiCashRevenue"),
            value: formatAmdFromCents(studio.kpis.revenueCents, locale),
            deltaPercent: studio.comparison.revenueCents.trendPercent,
            hint: t("comparison.previousPeriod"),
          },
        ]
      : []),
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
      {includeFinance ? (
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
      ) : null}
      <AdminAnalyticsPanelSection index={includeFinance ? 2 : 1}>
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
      <AdminAnalyticsPanelSection index={includeFinance ? 3 : 2}>
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
      {includeFinance ? (
        <AdminAnalyticsPanelSection index={4}>
          <AdminAnalyticsChartPanel
            title={t("sections.financeRankings.title")}
            hint={t("sections.financeRankings.hint")}
          >
            <AnalyticsRankTable
              rows={financeTeaser}
              labels={{
                rank: t("table.rank"),
                name: t("table.name"),
                count: t("table.amount"),
              }}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminAnalyticsPanelSection index={includeFinance ? 5 : 3}>
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
        <AdminAnalyticsPanelSection index={includeFinance ? 6 : 4}>
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

function buildFinanceTeaserRows(
  studio: AdminAnalyticsPayload["studio"],
  locale: string,
  unassigned: string,
  emptyLabel: string,
  labels: { package: string; classType: string; coach: string },
) {
  const topPackage = pickTopNamedAmount(studio.revenue.byPackage);
  const topClass = pickTopNamedAmount(
    studio.revenue.byClassType.map((entry) => ({
      label: resolveClassTypeLabel(entry.id, entry.label, unassigned),
      amountCents: entry.amountCents,
    })),
  );
  const topCoach = pickTopNamedAmount(studio.revenue.byCoach);
  return [
    teaserRow("package", labels.package, topPackage, locale, emptyLabel),
    teaserRow("class", labels.classType, topClass, locale, emptyLabel),
    teaserRow("coach", labels.coach, topCoach, locale, emptyLabel),
  ];
}

function teaserRow(
  key: string,
  category: string,
  row: { label: string; amountCents: number } | null,
  locale: string,
  emptyLabel: string,
) {
  return {
    key,
    label: category,
    value: row?.amountCents ?? 0,
    displayValue: formatNamedAmount(row, locale, emptyLabel),
  };
}
