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
import { AdminAnalyticsDonutChart } from "@/components/admin/admin-analytics-donut-chart";
import { AdminAnalyticsKpiStrip } from "@/components/admin/admin-analytics-kpi-strip";
import { AdminAnalyticsPanelSection } from "@/components/admin/admin-analytics-panel-motion";
import {
  buildBookingStatusDonutItems,
  buildChannelBarItems,
  buildClassOccupancyBarItems,
  buildPeakHourColumnData,
  buildPeakWeekdayColumnData,
  formatRatePercent,
} from "@/components/admin/admin-analytics-studio-map";
import { sliceSortedBarItems } from "@/components/admin/admin-analytics-chart-data";
import { sumBucketValues } from "@/components/admin/admin-analytics-trend-data";
import type { AdminAnalyticsPayload } from "@/components/admin/admin-analytics-types";

type AdminAnalyticsBookingsPanelProps = {
  data: AdminAnalyticsPayload;
};

export function AdminAnalyticsBookingsPanel({ data }: AdminAnalyticsBookingsPanelProps) {
  const t = useTranslations("adminPages.analytics");
  const studio = data.studio;
  const sortKey = data.sortKey;

  const bookingStatusLabels = useMemo(
    () => ({
      booked: t("bookingStatus.booked"),
      completed: t("bookingStatus.completed"),
      cancelled: t("bookingStatus.cancelled"),
      missed: t("bookingStatus.missed"),
      waitlisted: t("bookingStatus.waitlisted"),
    }),
    [t],
  );
  const weekdayLabels = useMemo(
    () => [
      t("weekdays.sun"),
      t("weekdays.mon"),
      t("weekdays.tue"),
      t("weekdays.wed"),
      t("weekdays.thu"),
      t("weekdays.fri"),
      t("weekdays.sat"),
    ],
    [t],
  );

  const bookingStatusItems = useMemo(
    () => buildBookingStatusDonutItems(studio, sortKey, bookingStatusLabels),
    [bookingStatusLabels, sortKey, studio],
  );
  const classOccupancy = useMemo(
    () =>
      sliceSortedBarItems(
        buildClassOccupancyBarItems(studio, sortKey, t("notAvailable")),
        sortKey,
        10,
      ),
    [sortKey, studio, t],
  );
  const channelItems = useMemo(
    () =>
      buildChannelBarItems(studio, {
        website: t("sections.channels.website"),
        app: t("sections.channels.app"),
      }),
    [studio, t],
  );
  const peakWeekdays = useMemo(
    () => buildPeakWeekdayColumnData(studio, weekdayLabels),
    [studio, weekdayLabels],
  );
  const peakHours = useMemo(() => buildPeakHourColumnData(studio), [studio]);
  const trendChartData = useMemo(() => mapDailyTrendForChart(data.dailyTrend), [data.dailyTrend]);
  const bookingsTrendTotal = sumBucketValues(data.dailyTrend, "total");
  const completedTrendTotal = sumBucketValues(data.dailyTrend, "completed");
  const peakWeekdayTotal = peakWeekdays.reduce((sum, row) => sum + row.bookings, 0);
  const peakHourTotal = peakHours.reduce((sum, row) => sum + row.bookings, 0);
  const showChannels =
    studio.operations.channels.WEBSITE > 0 || studio.operations.channels.APP > 0;

  const kpis = [
    {
      key: "total",
      label: t("kpiBookingsInRange"),
      value: String(studio.kpis.bookingsTotal),
      deltaPercent: studio.comparison.bookings.trendPercent,
      hint: t("comparison.previousPeriod"),
    },
    {
      key: "completed",
      label: t("sections.attendance.completed"),
      value: String(studio.operations.bookingsByStatus.COMPLETED),
    },
    {
      key: "missed",
      label: t("sections.attendance.missed"),
      value: String(studio.operations.bookingsByStatus.MISSED),
    },
    {
      key: "attendance",
      label: t("kpiAttendanceRate"),
      value: formatRatePercent(studio.kpis.attendanceRate, t("notAvailable")),
      deltaPercent: studio.comparison.attendanceRate.trendPercent,
    },
    {
      key: "occupancy",
      label: t("kpiOccupancyRate"),
      value: formatRatePercent(studio.kpis.occupancyRate, t("notAvailable")),
      deltaPercent: studio.comparison.occupancyRate.trendPercent,
    },
    {
      key: "cancellation",
      label: t("kpiCancellationRate"),
      value: formatRatePercent(studio.kpis.cancellationRate, t("notAvailable")),
    },
    {
      key: "noShow",
      label: t("kpiNoShowRate"),
      value: formatRatePercent(studio.kpis.noShowRate, t("notAvailable")),
    },
    {
      key: "waitlist",
      label: t("kpiWaitlistActive"),
      value: String(studio.kpis.waitlistActive),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminAnalyticsPanelSection index={0}>
        <AdminAnalyticsKpiStrip items={kpis} trendNotAvailableLabel={t("trendNotAvailable")} />
      </AdminAnalyticsPanelSection>
      <AdminAnalyticsPanelSection index={1}>
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
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminAnalyticsPanelSection index={2}>
          <AdminAnalyticsChartPanel
            title={t("sections.bookings.title")}
            hint={t("sections.bookings.hint")}
          >
            <AdminAnalyticsDonutChart
              items={bookingStatusItems}
              emptyLabel={t("empty")}
              ariaLabel={t("sections.bookings.chartAria")}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
        <AdminAnalyticsPanelSection index={3}>
          <AdminAnalyticsChartPanel
            title={t("sections.occupancy.byClassTitle")}
            hint={t("sections.occupancy.byClassHint")}
          >
            <AdminAnalyticsBarList
              items={classOccupancy}
              emphasis
              emptyLabel={t("empty")}
              ariaLabel={t("sections.occupancy.byClassChartAria")}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
        <AdminAnalyticsPanelSection index={4}>
          <AdminAnalyticsChartPanel
            title={t("sections.peaks.weekdayTitle")}
            hint={t("sections.peaks.weekdayHint")}
          >
            <AdminAnalyticsColumnChart
              data={peakWeekdays}
              xKey="label"
              series={[
                {
                  key: "bookings",
                  label: t("sections.peaks.bookingsSeries"),
                  color: ANALYTICS_CHART_BLUE,
                  totalLabel: String(peakWeekdayTotal),
                },
              ]}
              emptyLabel={t("empty")}
              ariaLabel={t("sections.peaks.weekdayChartAria")}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
        <AdminAnalyticsPanelSection index={5}>
          <AdminAnalyticsChartPanel
            title={t("sections.peaks.hourTitle")}
            hint={t("sections.peaks.hourHint")}
          >
            <AdminAnalyticsColumnChart
              data={peakHours}
              xKey="label"
              series={[
                {
                  key: "bookings",
                  label: t("sections.peaks.bookingsSeries"),
                  color: ANALYTICS_CHART_INK,
                  totalLabel: String(peakHourTotal),
                },
              ]}
              emptyLabel={t("empty")}
              ariaLabel={t("sections.peaks.hourChartAria")}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
        {showChannels ? (
          <AdminAnalyticsPanelSection index={6}>
            <AdminAnalyticsChartPanel
              title={t("sections.channels.title")}
              hint={t("sections.channels.hint")}
            >
              <AdminAnalyticsBarList
                items={channelItems}
                emphasis
                emptyLabel={t("empty")}
                ariaLabel={t("sections.channels.chartAria")}
              />
            </AdminAnalyticsChartPanel>
          </AdminAnalyticsPanelSection>
        ) : null}
      </div>
    </div>
  );
}
