"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminAnalyticsBarList } from "@/components/admin/admin-analytics-bar-list";
import { AdminAnalyticsChartPanel } from "@/components/admin/admin-analytics-chart-panel";
import { AdminAnalyticsColumnChart } from "@/components/admin/admin-analytics-column-chart";
import { AdminAnalyticsDonutChart } from "@/components/admin/admin-analytics-donut-chart";
import { AdminAnalyticsPanelSection } from "@/components/admin/admin-analytics-panel-motion";
import { ANALYTICS_CHART_BLUE } from "@/components/admin/admin-analytics-area-chart-config";
import {
  buildClassTypeSalesColumnData,
  buildPackageSalesBarItems,
} from "@/components/admin/admin-analytics-finance-map";
import { sliceSortedBarItems } from "@/components/admin/admin-analytics-chart-data";
import {
  buildAttributedCoachRevenueItems,
  buildRevenueSourceBarItems,
} from "@/components/admin/admin-analytics-studio-map";
import type { AdminAnalyticsPayload } from "@/components/admin/admin-analytics-types";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminAnalyticsRevenueChartsProps = {
  data: AdminAnalyticsPayload;
};

export function AdminAnalyticsRevenueCharts({ data }: AdminAnalyticsRevenueChartsProps) {
  const t = useTranslations("adminPages.analytics");
  const charts = useRevenueChartItems(data, t("unassignedClassType"), t);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <RevenueSourceDonut charts={charts} />
      <RevenueClassColumn charts={charts} locale={data.locale} />
      <RevenuePackageBars charts={charts} />
      <RevenueCoachBars charts={charts} />
    </div>
  );
}

function useRevenueChartItems(
  data: AdminAnalyticsPayload,
  unassigned: string,
  t: ReturnType<typeof useTranslations>,
) {
  const { studio, sortKey, locale } = data;
  const sourceLabels = useMemo(
    () => ({
      package: t("sources.package"),
      dropin: t("sources.dropin"),
      gift: t("sources.gift"),
      other: t("sources.other"),
    }),
    [t],
  );
  const sources = useMemo(
    () => buildRevenueSourceBarItems(studio, sortKey, sourceLabels, locale),
    [locale, sortKey, sourceLabels, studio],
  );
  const packages = useMemo(
    () => sliceSortedBarItems(buildPackageSalesBarItems(studio, sortKey, locale), sortKey, 10),
    [locale, sortKey, studio],
  );
  const coaches = useMemo(
    () => sliceSortedBarItems(buildAttributedCoachRevenueItems(studio, sortKey, locale), sortKey, 10),
    [locale, sortKey, studio],
  );
  const classColumns = useMemo(
    () => buildClassTypeSalesColumnData(studio, sortKey, unassigned),
    [sortKey, studio, unassigned],
  );
  const classTotal = studio.revenue.byClassType.reduce((sum, entry) => sum + entry.amountCents, 0);
  return { sources, packages, coaches, classColumns, classTotal };
}

type RevenueChartItems = ReturnType<typeof useRevenueChartItems>;

function RevenueSourceDonut({ charts }: { charts: RevenueChartItems }) {
  const t = useTranslations("adminPages.analytics");
  return (
    <AdminAnalyticsPanelSection index={2}>
      <AdminAnalyticsChartPanel title={t("sections.revenue.title")} hint={t("sections.revenue.cashHint")}>
        <AdminAnalyticsDonutChart
          items={charts.sources}
          emptyLabel={t("empty")}
          ariaLabel={t("sections.revenue.chartAria")}
        />
      </AdminAnalyticsChartPanel>
    </AdminAnalyticsPanelSection>
  );
}

function RevenueClassColumn({
  charts,
  locale,
}: {
  charts: RevenueChartItems;
  locale: string;
}) {
  const t = useTranslations("adminPages.analytics");
  return (
    <AdminAnalyticsPanelSection index={3}>
      <AdminAnalyticsChartPanel title={t("sections.classRevenue.title")} hint={t("sections.classRevenue.salesHint")}>
        <AdminAnalyticsColumnChart
          data={charts.classColumns}
          xKey="label"
          series={[
            {
              key: "amount",
              label: t("sections.classRevenue.series"),
              color: ANALYTICS_CHART_BLUE,
              totalLabel: formatAmdFromCents(charts.classTotal, locale),
            },
          ]}
          emptyLabel={t("empty")}
          ariaLabel={t("sections.classRevenue.chartAria")}
          valueFormatter={(value) => formatAmdFromCents(value, locale)}
        />
      </AdminAnalyticsChartPanel>
    </AdminAnalyticsPanelSection>
  );
}

function RevenuePackageBars({ charts }: { charts: RevenueChartItems }) {
  const t = useTranslations("adminPages.analytics");
  return (
    <AdminAnalyticsPanelSection index={4}>
      <AdminAnalyticsChartPanel title={t("sections.packageSales.title")} hint={t("sections.packageSales.hint")}>
        <AdminAnalyticsBarList
          items={charts.packages}
          emphasis
          emptyLabel={t("empty")}
          ariaLabel={t("sections.packageSales.chartAria")}
        />
      </AdminAnalyticsChartPanel>
    </AdminAnalyticsPanelSection>
  );
}

function RevenueCoachBars({ charts }: { charts: RevenueChartItems }) {
  const t = useTranslations("adminPages.analytics");
  return (
    <AdminAnalyticsPanelSection index={5}>
      <AdminAnalyticsChartPanel
        title={t("sections.coachRevenue.title")}
        hint={t("sections.coachRevenue.attributedHint")}
      >
        <AdminAnalyticsBarList
          items={charts.coaches}
          emphasis
          emptyLabel={t("empty")}
          ariaLabel={t("sections.coachRevenue.chartAria")}
        />
      </AdminAnalyticsChartPanel>
    </AdminAnalyticsPanelSection>
  );
}
