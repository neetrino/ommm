"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminAnalyticsBarList } from "@/components/admin/admin-analytics-bar-list";
import { AdminAnalyticsChartPanel } from "@/components/admin/admin-analytics-chart-panel";
import { AdminAnalyticsKpiStrip } from "@/components/admin/admin-analytics-kpi-strip";
import { AdminAnalyticsPanelSection } from "@/components/admin/admin-analytics-panel-motion";
import {
  buildAttributedClassRevenueItems,
  buildCoachMetricBarItems,
  formatRatePercent,
} from "@/components/admin/admin-analytics-studio-map";
import { sliceSortedBarItems } from "@/components/admin/admin-analytics-chart-data";
import type { AdminAnalyticsPayload } from "@/components/admin/admin-analytics-types";

type AdminAnalyticsCoachesPanelProps = {
  data: AdminAnalyticsPayload;
};

export function AdminAnalyticsCoachesPanel({ data }: AdminAnalyticsCoachesPanelProps) {
  const t = useTranslations("adminPages.analytics");
  const studio = data.studio;
  const sortKey = data.sortKey;
  const locale = data.locale;
  const notAvailable = t("notAvailable");

  const coachBookings = useMemo(
    () =>
      sliceSortedBarItems(
        buildCoachMetricBarItems(studio, sortKey, "bookings", locale, notAvailable),
        sortKey,
        10,
      ),
    [locale, notAvailable, sortKey, studio],
  );
  const coachAttendance = useMemo(
    () =>
      sliceSortedBarItems(
        buildCoachMetricBarItems(studio, sortKey, "attendance", locale, notAvailable),
        sortKey,
        10,
      ),
    [locale, notAvailable, sortKey, studio],
  );
  const coachOccupancy = useMemo(
    () =>
      sliceSortedBarItems(
        buildCoachMetricBarItems(studio, sortKey, "occupancy", locale, notAvailable),
        sortKey,
        10,
      ),
    [locale, notAvailable, sortKey, studio],
  );
  const coachRevenue = useMemo(
    () =>
      sliceSortedBarItems(
        buildCoachMetricBarItems(studio, sortKey, "revenue", locale, notAvailable),
        sortKey,
        10,
      ),
    [locale, notAvailable, sortKey, studio],
  );
  const classRevenue = useMemo(
    () =>
      sliceSortedBarItems(buildAttributedClassRevenueItems(studio, sortKey, locale), sortKey, 10),
    [locale, sortKey, studio],
  );
  const coachSessions = useMemo(
    () =>
      sliceSortedBarItems(
        buildCoachMetricBarItems(studio, sortKey, "sessions", locale, notAvailable),
        sortKey,
        10,
      ),
    [locale, notAvailable, sortKey, studio],
  );

  const rows = studio.coaches.rows;
  const activeCoaches = rows.filter((coach) => coach.isActive).length;
  const totalSessions = rows.reduce((sum, coach) => sum + coach.sessions, 0);
  const topBookings = coachBookings[0];
  const topOccupancy = [...rows].sort(
    (a, b) => (b.occupancyRate ?? -1) - (a.occupancyRate ?? -1),
  )[0];
  const topAttendance = [...rows].sort(
    (a, b) => (b.attendanceRate ?? -1) - (a.attendanceRate ?? -1),
  )[0];

  const kpis = [
    {
      key: "coaches",
      label: t("sections.coachSessions.coachesCount"),
      value: String(rows.length),
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
      value: topBookings ? String(topBookings.value) : notAvailable,
    },
    {
      key: "topOccupancy",
      label: t("sections.coachPerformance.topOccupancy"),
      value: topOccupancy
        ? formatRatePercent(topOccupancy.occupancyRate, notAvailable)
        : notAvailable,
    },
    {
      key: "topAttendance",
      label: t("sections.coachPerformance.topAttendance"),
      value: topAttendance
        ? formatRatePercent(topAttendance.attendanceRate, notAvailable)
        : notAvailable,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminAnalyticsPanelSection index={0}>
        <AdminAnalyticsKpiStrip items={kpis} trendNotAvailableLabel={t("trendNotAvailable")} />
      </AdminAnalyticsPanelSection>
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminAnalyticsPanelSection index={1}>
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
        </AdminAnalyticsPanelSection>
        <AdminAnalyticsPanelSection index={2}>
          <AdminAnalyticsChartPanel title={t("sections.coachPerformance.attendanceTitle")}>
            <AdminAnalyticsBarList
              items={coachAttendance}
              emphasis
              emptyLabel={t("empty")}
              ariaLabel={t("sections.coachPerformance.attendanceChartAria")}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
        <AdminAnalyticsPanelSection index={3}>
          <AdminAnalyticsChartPanel
            title={t("sections.occupancy.byCoachTitle")}
            hint={t("sections.occupancy.byCoachHint")}
          >
            <AdminAnalyticsBarList
              items={coachOccupancy}
              emphasis
              emptyLabel={t("empty")}
              ariaLabel={t("sections.occupancy.byCoachChartAria")}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
        <AdminAnalyticsPanelSection index={4}>
          <AdminAnalyticsChartPanel
            title={t("sections.coachRevenue.title")}
            hint={t("sections.coachRevenue.attributedHint")}
          >
            <AdminAnalyticsBarList
              items={coachRevenue}
              emphasis
              emptyLabel={t("empty")}
              ariaLabel={t("sections.coachRevenue.chartAria")}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
        <AdminAnalyticsPanelSection index={5}>
          <AdminAnalyticsChartPanel
            title={t("sections.classRevenue.title")}
            hint={t("sections.classRevenue.attributedHint")}
          >
            <AdminAnalyticsBarList
              items={classRevenue}
              emphasis
              emptyLabel={t("empty")}
              ariaLabel={t("sections.classRevenue.chartAria")}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
        <AdminAnalyticsPanelSection index={6}>
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
        </AdminAnalyticsPanelSection>
      </div>
    </div>
  );
}
