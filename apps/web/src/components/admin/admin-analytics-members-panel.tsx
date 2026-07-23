"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminAnalyticsBarList } from "@/components/admin/admin-analytics-bar-list";
import { AdminAnalyticsChartPanel } from "@/components/admin/admin-analytics-chart-panel";
import { buildMemberSegmentItems } from "@/components/admin/admin-analytics-chart-data";
import { AdminAnalyticsDonutChart } from "@/components/admin/admin-analytics-donut-chart";
import { AdminAnalyticsKpiStrip } from "@/components/admin/admin-analytics-kpi-strip";
import type { AdminAnalyticsPayload } from "@/components/admin/admin-analytics-types";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminAnalyticsMembersPanelProps = {
  data: AdminAnalyticsPayload;
};

export function AdminAnalyticsMembersPanel({ data }: AdminAnalyticsMembersPanelProps) {
  const t = useTranslations("adminPages.analytics");
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

  const segmentDonutItems = useMemo(
    () => [
      ...memberSegments,
      {
        key: "other",
        label: t("sections.users.inactive"),
        value: Math.max(0, data.clients.total - data.clients.active),
      },
    ],
    [data.clients.active, data.clients.total, memberSegments, t],
  );

  const kpis = [
    { key: "total", label: t("sections.users.total"), value: String(data.clients.total) },
    { key: "active", label: t("sections.users.active"), value: String(data.clients.active) },
    { key: "vip", label: t("sections.users.vip"), value: String(data.clients.vip) },
    { key: "visits", label: t("sections.users.visits"), value: String(data.clients.totalVisits) },
    {
      key: "ltv",
      label: t("sections.users.ltv"),
      value: formatAmdFromCents(data.clients.lifetimeValueCents, locale),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminAnalyticsKpiStrip items={kpis} />
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminAnalyticsChartPanel title={t("sections.users.title")} hint={t("sections.users.hint")}>
          <AdminAnalyticsDonutChart
            items={segmentDonutItems}
            emptyLabel={t("empty")}
            ariaLabel={t("sections.users.chartAria")}
          />
        </AdminAnalyticsChartPanel>
        <AdminAnalyticsChartPanel title={t("sections.users.segmentsTitle")}>
          <AdminAnalyticsBarList
            items={memberSegments}
            emphasis
            emptyLabel={t("empty")}
            ariaLabel={t("sections.users.chartAria")}
          />
        </AdminAnalyticsChartPanel>
      </div>
    </div>
  );
}
