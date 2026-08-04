"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  ANALYTICS_CHART_BLUE,
  ANALYTICS_CHART_INK,
} from "@/components/admin/admin-analytics-area-chart-config";
import { AdminAnalyticsAreaChart } from "@/components/admin/admin-analytics-area-chart";
import { AdminAnalyticsColumnChart } from "@/components/admin/admin-analytics-column-chart";
import { AdminAnalyticsBarList } from "@/components/admin/admin-analytics-bar-list";
import { AdminAnalyticsChartPanel } from "@/components/admin/admin-analytics-chart-panel";
import {
  buildCoachAnalyticsInsights,
  formatPeakTimeLabel,
  mapClassTypeBarItems,
  mapCoachTrendForChart,
  mapHourlyBarItems,
} from "@/components/coach/coach-analytics-helpers";
import { CoachAnalyticsPeriodSelector } from "@/components/coach/coach-analytics-period-selector";
import { CoachAnalyticsKpiHero } from "@/components/coach/coach-analytics-kpi-hero";
import type {
  CoachAnalyticsPayload,
  CoachAnalyticsPeriod,
} from "@/components/coach/coach-analytics-types";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";

type CoachAnalyticsPanelProps = {
  data: CoachAnalyticsPayload;
  locale: string;
  period: CoachAnalyticsPeriod;
};

export function CoachAnalyticsPanel({ data, locale, period }: CoachAnalyticsPanelProps) {
  const t = useTranslations("coachPages.analytics");
  const { totals } = data;

  const trendChartData = useMemo(
    () => mapCoachTrendForChart(data.trend, locale, data.periodDays),
    [data.trend, data.periodDays, locale],
  );
  const classTypeItems = useMemo(
    () => mapClassTypeBarItems(data.classTypeBreakdown),
    [data.classTypeBreakdown],
  );
  const peakHourItems = useMemo(
    () => mapHourlyBarItems(data.hourlyAttendance, locale),
    [data.hourlyAttendance, locale],
  );
  const insights = useMemo(() => buildCoachAnalyticsInsights(data), [data]);

  const peakTimeLabel =
    totals.peakTime !== null
      ? formatPeakTimeLabel(totals.peakTime.hour)
      : t("notAvailable");

  const activityKpis = [
    {
      label: t("totalClassesTaught"),
      value: String(totals.totalClassesTaught),
    },
    {
      label: t("totalClientsTrained"),
      value: String(totals.totalClientsTrained),
    },
    {
      label: t("averageAttendanceRate"),
      value:
        totals.averageAttendanceRate === null
          ? t("notAvailable")
          : `${totals.averageAttendanceRate}%`,
    },
  ];

  const performanceKpis = [
    {
      label: t("classFillRate"),
      value: `${totals.classFillRate}%`,
    },
    {
      label: t("mostPopularClassType"),
      value: totals.mostPopularClassType ?? t("notAvailable"),
    },
    {
      label: t("peakTime"),
      value: peakTimeLabel,
    },
  ];

  return (
    <StaffListPageLayout
      title={t("title")}
      headerTrailing={<CoachAnalyticsPeriodSelector value={period} />}
    >
      <CoachAnalyticsKpiHero
        activityTitle={t("kpiGroupActivity")}
        performanceTitle={t("kpiGroupPerformance")}
        activity={activityKpis}
        performance={performanceKpis}
      />

      {insights.length > 0 ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {insights.map((insight) => (
            <article
              key={insight.key}
              className={
                insight.kind === "strength"
                  ? "rounded-[20px] border border-emerald-200/70 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-950"
                  : "rounded-[20px] border border-amber-200/70 bg-amber-50/70 px-4 py-3 text-sm text-amber-950"
              }
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
                {insight.kind === "strength" ? t("strengthLabel") : t("improvementLabel")}
              </p>
              <p className="mt-1">{t(`insights.${insight.key}`, {
                fillRate: totals.classFillRate,
                attendanceRate: totals.averageAttendanceRate ?? 0,
                classType: totals.mostPopularClassType ?? t("notAvailable"),
                peakTime: peakTimeLabel,
                waitlistPressure: totals.waitlistPressurePercent,
              })}</p>
            </article>
          ))}
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminAnalyticsChartPanel
          title={t("attendanceTrendTitle")}
          hint={t("attendanceTrendHint")}
        >
          <AdminAnalyticsAreaChart
            data={trendChartData}
            xKey="label"
            series={[
              {
                key: "attendance",
                label: t("attendanceSeries"),
                color: ANALYTICS_CHART_BLUE,
                totalLabel: String(totals.completed),
              },
            ]}
            emptyLabel={t("empty")}
            ariaLabel={t("attendanceTrendAria")}
          />
        </AdminAnalyticsChartPanel>

        <AdminAnalyticsChartPanel
          title={t("attendanceColumnTitle")}
          hint={t("attendanceColumnHint")}
        >
          <AdminAnalyticsColumnChart
            data={trendChartData}
            xKey="label"
            series={[
              {
                key: "attendance",
                label: t("attendanceSeries"),
                color: ANALYTICS_CHART_BLUE,
                totalLabel: String(totals.completed),
              },
            ]}
            emptyLabel={t("empty")}
            ariaLabel={t("attendanceColumnAria")}
          />
        </AdminAnalyticsChartPanel>

        <AdminAnalyticsChartPanel title={t("fillRateTrendTitle")} hint={t("fillRateTrendHint")}>
          <AdminAnalyticsAreaChart
            data={trendChartData}
            xKey="label"
            series={[
              {
                key: "fillRate",
                label: t("fillRateSeries"),
                color: ANALYTICS_CHART_INK,
                totalLabel: `${totals.classFillRate}%`,
              },
            ]}
            emptyLabel={t("empty")}
            ariaLabel={t("fillRateTrendAria")}
            valueFormatter={(value) => `${value}%`}
          />
        </AdminAnalyticsChartPanel>

        <AdminAnalyticsChartPanel title={t("fillRateColumnTitle")} hint={t("fillRateColumnHint")}>
          <AdminAnalyticsColumnChart
            data={trendChartData}
            xKey="label"
            series={[
              {
                key: "fillRate",
                label: t("fillRateSeries"),
                color: ANALYTICS_CHART_INK,
                totalLabel: `${totals.classFillRate}%`,
              },
            ]}
            emptyLabel={t("empty")}
            ariaLabel={t("fillRateColumnAria")}
            yMax={100}
            valueFormatter={(value) => `${value}%`}
          />
        </AdminAnalyticsChartPanel>

        <AdminAnalyticsChartPanel
          title={t("classTypeBreakdownTitle")}
          hint={t("classTypeBreakdownHint")}
        >
          <AdminAnalyticsBarList
            items={classTypeItems}
            emphasis
            emptyLabel={t("empty")}
            ariaLabel={t("classTypeBreakdownAria")}
          />
        </AdminAnalyticsChartPanel>

        <AdminAnalyticsChartPanel title={t("peakHoursTitle")} hint={t("peakHoursHint")}>
          <AdminAnalyticsBarList
            items={peakHourItems}
            emphasis
            emptyLabel={t("emptyPeakHours")}
            ariaLabel={t("peakHoursAria")}
          />
        </AdminAnalyticsChartPanel>
      </div>
    </StaffListPageLayout>
  );
}
