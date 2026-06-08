"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminAnalyticsBarList } from "@/components/admin/admin-analytics-bar-list";
import { AdminAnalyticsChartPanel } from "@/components/admin/admin-analytics-chart-panel";
import {
  buildCoachSessionsItems,
  sliceSortedBarItems,
} from "@/components/admin/admin-analytics-chart-data";
import { AdminAnalyticsKpiStrip } from "@/components/admin/admin-analytics-kpi-strip";
import type { AdminAnalyticsPayload } from "@/components/admin/admin-analytics-types";

type AdminAnalyticsCoachesPanelProps = {
  data: AdminAnalyticsPayload;
};

export function AdminAnalyticsCoachesPanel({ data }: AdminAnalyticsCoachesPanelProps) {
  const t = useTranslations("adminPages.analytics");
  const sortKey = data.sortKey;

  const coachBookings = useMemo(
    () => sliceSortedBarItems(data.bookings.coachBookings, sortKey, 10),
    [data.bookings.coachBookings, sortKey],
  );
  const coachAttendance = useMemo(
    () => sliceSortedBarItems(data.bookings.coachAttendance, sortKey, 10),
    [data.bookings.coachAttendance, sortKey],
  );
  const coachSessions = useMemo(
    () => buildCoachSessionsItems(data, sortKey),
    [data, sortKey],
  );

  const totalSessions = data.coaches.reduce((sum, coach) => sum + coach.totalClasses, 0);
  const activeCoaches = data.coaches.filter((coach) => coach.isActive).length;
  const topBookings = coachBookings[0];

  const kpis = [
    {
      key: "coaches",
      label: t("sections.coachSessions.coachesCount"),
      value: String(data.coaches.length),
    },
    {
      key: "active",
      label: t("sections.coachSessions.activeCoaches"),
      value: String(activeCoaches),
    },
    {
      key: "sessions",
      label: t("sections.coachSessions.totalSessions"),
      value: String(totalSessions),
    },
    {
      key: "topBookings",
      label: t("sections.coachPerformance.topBookings"),
      value: topBookings ? String(topBookings.value) : t("notAvailable"),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminAnalyticsKpiStrip items={kpis} />
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminAnalyticsChartPanel
          title={t("sections.coachPerformance.bookingsTitle")}
          hint={t("sections.coachPerformance.hint")}
        >
          <AdminAnalyticsBarList
            items={coachBookings}
            emphasis
            emptyLabel={t("empty")}
            ariaLabel={t("sections.coachPerformance.chartAria")}
          />
        </AdminAnalyticsChartPanel>
        <AdminAnalyticsChartPanel title={t("sections.coachPerformance.attendanceTitle")}>
          <AdminAnalyticsBarList
            items={coachAttendance}
            emphasis
            emptyLabel={t("empty")}
            ariaLabel={t("sections.coachPerformance.attendanceChartAria")}
          />
        </AdminAnalyticsChartPanel>
        <AdminAnalyticsChartPanel
          title={t("sections.coachSessions.title")}
          hint={t("sections.coachSessions.hint")}
        >
          <AdminAnalyticsBarList
            items={coachSessions}
            emphasis
            emptyLabel={t("empty")}
            ariaLabel={t("sections.coachSessions.chartAria")}
          />
        </AdminAnalyticsChartPanel>
        <AdminAnalyticsChartPanel
          title={t("sections.coachRevenue.title")}
          unsupported={t("sections.coachRevenue.unsupported")}
        />
        <AdminAnalyticsChartPanel
          title={t("sections.classRevenue.title")}
          unsupported={t("sections.classRevenue.unsupported")}
        />
      </div>
    </div>
  );
}
