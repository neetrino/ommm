"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminAnalyticsBarList } from "@/components/admin/admin-analytics-bar-list";
import { AdminAnalyticsChartPanel } from "@/components/admin/admin-analytics-chart-panel";
import { AdminAnalyticsDonutChart } from "@/components/admin/admin-analytics-donut-chart";
import { AdminAnalyticsKpiStrip } from "@/components/admin/admin-analytics-kpi-strip";
import { AdminAnalyticsPanelSection } from "@/components/admin/admin-analytics-panel-motion";
import { AnalyticsMetricTable } from "@/components/admin/admin-analytics-shared-ui";
import {
  buildMemberSegmentBarItems,
  buildPackageHealthBarItems,
  formatRatePercent,
} from "@/components/admin/admin-analytics-studio-map";
import type { AdminAnalyticsPayload } from "@/components/admin/admin-analytics-types";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminAnalyticsMembersPanelProps = {
  data: AdminAnalyticsPayload;
};

export function AdminAnalyticsMembersPanel({ data }: AdminAnalyticsMembersPanelProps) {
  const t = useTranslations("adminPages.analytics");
  const studio = data.studio;
  const locale = data.locale;
  const members = studio.members;

  const segmentLabels = useMemo(
    () => ({
      newMembers: t("sections.users.newInRange"),
      returning: t("sections.users.returning"),
      inactive30d: t("sections.users.inactive30d"),
      active: t("sections.users.active"),
      vip: t("sections.users.vip"),
    }),
    [t],
  );
  const packageLabels = useMemo(
    () => ({
      active: t("sections.packages.active"),
      paused: t("sections.packages.paused"),
      expiring7d: t("sections.packages.expiring7d"),
      expiredInRange: t("sections.packages.expiredInRange"),
    }),
    [t],
  );

  const memberSegments = useMemo(
    () => buildMemberSegmentBarItems(studio, segmentLabels),
    [segmentLabels, studio],
  );
  const packageHealth = useMemo(
    () => buildPackageHealthBarItems(studio, packageLabels),
    [packageLabels, studio],
  );
  const segmentDonutItems = useMemo(
    () => [
      { key: "new", label: segmentLabels.newMembers, value: members.newInRange },
      { key: "returning", label: segmentLabels.returning, value: members.returningInRange },
      { key: "inactive30d", label: segmentLabels.inactive30d, value: members.inactive30d },
    ],
    [members.inactive30d, members.newInRange, members.returningInRange, segmentLabels],
  );
  const retentionRows = useMemo(
    () => [
      {
        label: t("sections.retention.rate"),
        value: formatRatePercent(members.retentionRate, t("notAvailable")),
      },
      {
        label: t("sections.retention.firstVisits"),
        value: String(members.firstVisitsInRange),
      },
      {
        label: t("sections.retention.newMembers"),
        value: String(members.newInRange),
      },
      {
        label: t("sections.retention.returning"),
        value: String(members.returningInRange),
      },
    ],
    [members, t],
  );

  const kpis = [
    { key: "total", label: t("sections.users.total"), value: String(members.total) },
    { key: "active", label: t("sections.users.active"), value: String(members.active) },
    { key: "vip", label: t("sections.users.vip"), value: String(members.vip) },
    { key: "new", label: t("sections.users.newInRange"), value: String(members.newInRange) },
    {
      key: "returning",
      label: t("sections.users.returning"),
      value: String(members.returningInRange),
    },
    {
      key: "inactive30d",
      label: t("sections.users.inactive30d"),
      value: String(members.inactive30d),
    },
    {
      key: "retention",
      label: t("sections.retention.rate"),
      value: formatRatePercent(members.retentionRate, t("notAvailable")),
    },
    {
      key: "ltv",
      label: t("sections.users.ltv"),
      value: formatAmdFromCents(members.lifetimeValueCents, locale),
    },
    {
      key: "visits",
      label: t("sections.users.visitsInRange"),
      value: String(members.totalVisitsInRange),
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
            title={t("sections.users.segmentsTitle")}
            hint={t("sections.users.segmentsHint")}
          >
            <AdminAnalyticsDonutChart
              items={segmentDonutItems}
              emptyLabel={t("empty")}
              ariaLabel={t("sections.users.chartAria")}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
        <AdminAnalyticsPanelSection index={2}>
          <AdminAnalyticsChartPanel title={t("sections.users.title")} hint={t("sections.users.hint")}>
            <AdminAnalyticsBarList
              items={memberSegments}
              emphasis
              emptyLabel={t("empty")}
              ariaLabel={t("sections.users.chartAria")}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
        <AdminAnalyticsPanelSection index={3}>
          <AdminAnalyticsChartPanel
            title={t("sections.packages.title")}
            hint={t("sections.packages.hint")}
          >
            <AdminAnalyticsBarList
              items={packageHealth}
              emphasis
              emptyLabel={t("empty")}
              ariaLabel={t("sections.packages.chartAria")}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
        <AdminAnalyticsPanelSection index={4}>
          <AdminAnalyticsChartPanel
            title={t("sections.retention.title")}
            hint={t("sections.retention.hint")}
          >
            <AnalyticsMetricTable
              rows={retentionRows}
              labels={{ metric: t("table.metric"), value: t("table.value") }}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
      </div>
    </div>
  );
}
