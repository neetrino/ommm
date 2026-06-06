"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminAnalyticsBarList } from "@/components/admin/admin-analytics-bar-list";
import { AdminAnalyticsChartPanel } from "@/components/admin/admin-analytics-chart-panel";
import {
  buildBookingStatusItems,
  buildMemberSegmentItems,
  buildRevenueSourceItems,
  resolveRangeAttendanceRate,
  sliceSortedBarItems,
} from "@/components/admin/admin-analytics-chart-data";
import { AdminAnalyticsDonutChart } from "@/components/admin/admin-analytics-donut-chart";
import { AdminAnalyticsKpiStrip } from "@/components/admin/admin-analytics-kpi-strip";
import type { AdminAnalyticsPayload } from "@/components/admin/admin-analytics-types";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminAnalyticsOverviewPanelProps = {
  data: AdminAnalyticsPayload;
};

export function AdminAnalyticsOverviewPanel({ data }: AdminAnalyticsOverviewPanelProps) {
  const t = useTranslations("adminPages.analytics");
  const sortKey = data.sortKey;
  const locale = data.locale;

  const sourceLabels = useMemo(
    () => ({
      package: t("sources.package"),
      dropin: t("sources.dropin"),
      gift: t("sources.gift"),
      other: t("sources.other"),
    }),
    [t],
  );

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

  const userLabels = useMemo(
    () => ({
      active: t("sections.users.active"),
      vip: t("sections.users.vip"),
      atRisk: t("sections.users.atRisk"),
    }),
    [t],
  );

  const revenueSourceItems = useMemo(
    () => buildRevenueSourceItems(data, sortKey, sourceLabels),
    [data, sortKey, sourceLabels],
  );
  const bookingStatusItems = useMemo(
    () => buildBookingStatusItems(data, sortKey, bookingStatusLabels),
    [bookingStatusLabels, data, sortKey],
  );
  const memberSegments = useMemo(
    () => buildMemberSegmentItems(data, userLabels),
    [data, userLabels],
  );
  const topClasses = useMemo(
    () => sliceSortedBarItems(data.bookings.classPopularity, sortKey, 6),
    [data.bookings.classPopularity, sortKey],
  );
  const rangeAttendanceRate = resolveRangeAttendanceRate(data);

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
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminAnalyticsChartPanel title={t("sections.revenue.title")} hint={t("sections.revenue.hint")}>
          <AdminAnalyticsDonutChart
            items={revenueSourceItems}
            emptyLabel={t("empty")}
            ariaLabel={t("sections.revenue.chartAria")}
          />
        </AdminAnalyticsChartPanel>
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
