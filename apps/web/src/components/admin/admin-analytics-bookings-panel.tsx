"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminAnalyticsBarList } from "@/components/admin/admin-analytics-bar-list";
import { AdminAnalyticsChartPanel } from "@/components/admin/admin-analytics-chart-panel";
import {
  buildAttendanceBarItems,
  buildBookingStatusItems,
  resolveRangeAttendanceRate,
  resolveTodayAttendanceRate,
  sliceSortedBarItems,
} from "@/components/admin/admin-analytics-chart-data";
import { AdminAnalyticsDonutChart } from "@/components/admin/admin-analytics-donut-chart";
import { AdminAnalyticsKpiStrip } from "@/components/admin/admin-analytics-kpi-strip";
import type { AdminAnalyticsPayload } from "@/components/admin/admin-analytics-types";

type AdminAnalyticsBookingsPanelProps = {
  data: AdminAnalyticsPayload;
};

export function AdminAnalyticsBookingsPanel({ data }: AdminAnalyticsBookingsPanelProps) {
  const t = useTranslations("adminPages.analytics");
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

  const attendanceLabels = useMemo(
    () => ({
      completed: t("sections.attendance.completed"),
      missed: t("sections.attendance.missed"),
    }),
    [t],
  );

  const bookingStatusItems = useMemo(
    () => buildBookingStatusItems(data, sortKey, bookingStatusLabels),
    [bookingStatusLabels, data, sortKey],
  );
  const attendanceItems = useMemo(
    () => buildAttendanceBarItems(data, attendanceLabels),
    [attendanceLabels, data],
  );
  const classPopularity = useMemo(
    () => sliceSortedBarItems(data.bookings.classPopularity, sortKey, 10),
    [data.bookings.classPopularity, sortKey],
  );

  const rangeAttendanceRate = resolveRangeAttendanceRate(data);
  const todayAttendanceRate = resolveTodayAttendanceRate(data);

  const kpis = [
    {
      key: "total",
      label: t("kpiBookingsInRange"),
      value: String(data.bookings.summary.total),
    },
    {
      key: "completed",
      label: t("sections.attendance.completed"),
      value: String(data.bookings.summary.completed),
    },
    {
      key: "missed",
      label: t("sections.attendance.missed"),
      value: String(data.bookings.summary.missed),
    },
    {
      key: "rangeRate",
      label: t("sections.attendance.rangeRate"),
      value: rangeAttendanceRate === null ? t("notAvailable") : `${rangeAttendanceRate}%`,
    },
    {
      key: "todayRate",
      label: t("sections.attendance.todayRate"),
      value: todayAttendanceRate === null ? t("notAvailable") : `${todayAttendanceRate}%`,
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
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminAnalyticsChartPanel
          title={t("sections.bookings.title")}
          hint={t("sections.bookings.hint", { limit: data.bookings.sampledLimit })}
        >
          <AdminAnalyticsDonutChart
            items={bookingStatusItems}
            emptyLabel={t("empty")}
            ariaLabel={t("sections.bookings.chartAria")}
          />
        </AdminAnalyticsChartPanel>
        <AdminAnalyticsChartPanel title={t("sections.attendance.title")} hint={t("sections.attendance.hint")}>
          <AdminAnalyticsBarList
            items={attendanceItems}
            emphasis
            emptyLabel={t("empty")}
            ariaLabel={t("sections.attendance.chartAria")}
          />
        </AdminAnalyticsChartPanel>
        <AdminAnalyticsChartPanel
          title={t("sections.classPopularity.title")}
          hint={t("sections.classPopularity.hint", { limit: data.bookings.sampledLimit })}
          unsupported={classPopularity.length === 0 ? t("sections.classPopularity.empty") : undefined}
        >
          {classPopularity.length > 0 ? (
            <AdminAnalyticsBarList
              items={classPopularity}
              emphasis
              emptyLabel={t("empty")}
              ariaLabel={t("sections.classPopularity.chartAria")}
            />
          ) : null}
        </AdminAnalyticsChartPanel>
      </div>
    </div>
  );
}
