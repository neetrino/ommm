"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminAnalyticsAreaChart } from "@/components/admin/admin-analytics-area-chart";
import {
  ANALYTICS_CHART_BLUE,
  mapDailyTrendForChart,
} from "@/components/admin/admin-analytics-area-chart-config";
import { AdminAnalyticsBarList } from "@/components/admin/admin-analytics-bar-list";
import { AdminAnalyticsChartPanel } from "@/components/admin/admin-analytics-chart-panel";
import { AdminAnalyticsDonutChart } from "@/components/admin/admin-analytics-donut-chart";
import { AdminAnalyticsKpiStrip } from "@/components/admin/admin-analytics-kpi-strip";
import { AdminAnalyticsPanelSection } from "@/components/admin/admin-analytics-panel-motion";
import {
  buildAttributedClassRevenueItems,
  buildAttributedCoachRevenueItems,
  buildPaymentMethodBarItems,
  buildPaymentStatusBarItems,
  buildRevenueSourceBarItems,
} from "@/components/admin/admin-analytics-studio-map";
import { sliceSortedBarItems } from "@/components/admin/admin-analytics-chart-data";
import { sumBucketValues } from "@/components/admin/admin-analytics-trend-data";
import type { AdminAnalyticsPayload } from "@/components/admin/admin-analytics-types";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminAnalyticsRevenuePanelProps = {
  data: AdminAnalyticsPayload;
};

export function AdminAnalyticsRevenuePanel({ data }: AdminAnalyticsRevenuePanelProps) {
  const t = useTranslations("adminPages.analytics");
  const studio = data.studio;
  const sortKey = data.sortKey;
  const locale = data.locale;
  const gift = studio.revenue.giftCredits;

  const sourceLabels = useMemo(
    () => ({
      package: t("sources.package"),
      dropin: t("sources.dropin"),
      gift: t("sources.gift"),
      other: t("sources.other"),
    }),
    [t],
  );
  const paymentMethodLabels = useMemo(
    () => ({
      CASH: t("paymentMethods.CASH"),
      CARD: t("paymentMethods.CARD"),
      CARD_TERMINAL: t("paymentMethods.CARD_TERMINAL"),
      BANK_TRANSFER: t("paymentMethods.BANK_TRANSFER"),
      OTHER: t("paymentMethods.OTHER"),
    }),
    [t],
  );

  const revenueSourceItems = useMemo(
    () => buildRevenueSourceBarItems(studio, sortKey, sourceLabels, locale),
    [locale, sortKey, sourceLabels, studio],
  );
  const paymentStatusItems = useMemo(
    () => buildPaymentStatusBarItems(studio, sortKey, locale),
    [locale, sortKey, studio],
  );
  const paymentMethodItems = useMemo(
    () => buildPaymentMethodBarItems(studio, sortKey, paymentMethodLabels, locale),
    [locale, paymentMethodLabels, sortKey, studio],
  );
  const classRevenueItems = useMemo(
    () => sliceSortedBarItems(buildAttributedClassRevenueItems(studio, sortKey, locale), sortKey, 10),
    [locale, sortKey, studio],
  );
  const coachRevenueItems = useMemo(
    () => sliceSortedBarItems(buildAttributedCoachRevenueItems(studio, sortKey, locale), sortKey, 10),
    [locale, sortKey, studio],
  );
  const trendChartData = useMemo(() => mapDailyTrendForChart(data.dailyTrend), [data.dailyTrend]);
  const revenueTrendTotal = sumBucketValues(data.dailyTrend, "revenueCents");

  const kpis = [
    {
      key: "total",
      label: t("kpiCashRevenue"),
      value: formatAmdFromCents(studio.kpis.revenueCents, locale),
      deltaPercent: studio.comparison.revenueCents.trendPercent,
      hint: t("comparison.previousPeriod"),
    },
    {
      key: "payments",
      label: t("sections.revenue.payments"),
      value: String(studio.kpis.successfulPaymentsCount),
    },
    {
      key: "aov",
      label: t("sections.revenue.aov"),
      value: formatAmdFromCents(studio.kpis.averageOrderValueCents, locale),
    },
    {
      key: "giftOutstanding",
      label: t("kpiGiftOutstanding"),
      value: formatAmdFromCents(gift.outstandingCreditsCents, locale),
    },
  ];

  const giftKpis = [
    {
      key: "issued",
      label: t("sections.giftCredits.issued"),
      value: formatAmdFromCents(gift.issuedCents, locale),
    },
    {
      key: "redeemed",
      label: t("sections.giftCredits.redeemed"),
      value: formatAmdFromCents(gift.redeemedCents, locale),
    },
    {
      key: "spent",
      label: t("sections.giftCredits.spent"),
      value: formatAmdFromCents(gift.spentCents, locale),
    },
    {
      key: "outstanding",
      label: t("sections.giftCredits.outstanding"),
      value: formatAmdFromCents(gift.outstandingCreditsCents, locale),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminAnalyticsPanelSection index={0}>
        <AdminAnalyticsKpiStrip items={kpis} trendNotAvailableLabel={t("trendNotAvailable")} />
      </AdminAnalyticsPanelSection>
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
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminAnalyticsPanelSection index={2}>
          <AdminAnalyticsChartPanel
            title={t("sections.revenue.title")}
            hint={t("sections.revenue.cashHint")}
          >
            <AdminAnalyticsDonutChart
              items={revenueSourceItems}
              emptyLabel={t("empty")}
              ariaLabel={t("sections.revenue.chartAria")}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
        <AdminAnalyticsPanelSection index={3}>
          <AdminAnalyticsChartPanel title={t("sections.paymentStatus.title")}>
            <AdminAnalyticsBarList
              items={paymentStatusItems}
              emphasis
              emptyLabel={t("empty")}
              ariaLabel={t("sections.paymentStatus.chartAria")}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
        <AdminAnalyticsPanelSection index={4}>
          <AdminAnalyticsChartPanel
            title={t("sections.paymentMethod.title")}
            hint={t("sections.paymentMethod.hint")}
          >
            <AdminAnalyticsBarList
              items={paymentMethodItems}
              emphasis
              emptyLabel={t("empty")}
              ariaLabel={t("sections.paymentMethod.chartAria")}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
        <AdminAnalyticsPanelSection index={5}>
          <AdminAnalyticsChartPanel
            title={t("sections.classRevenue.title")}
            hint={t("sections.classRevenue.attributedHint")}
          >
            <AdminAnalyticsBarList
              items={classRevenueItems}
              emphasis
              emptyLabel={t("empty")}
              ariaLabel={t("sections.classRevenue.chartAria")}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
        <AdminAnalyticsPanelSection index={6}>
          <AdminAnalyticsChartPanel
            title={t("sections.coachRevenue.title")}
            hint={t("sections.coachRevenue.attributedHint")}
          >
            <AdminAnalyticsBarList
              items={coachRevenueItems}
              emphasis
              emptyLabel={t("empty")}
              ariaLabel={t("sections.coachRevenue.chartAria")}
            />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
        <AdminAnalyticsPanelSection index={7}>
          <AdminAnalyticsChartPanel
            title={t("sections.giftCredits.title")}
            hint={t("sections.giftCredits.hint")}
          >
            <AdminAnalyticsKpiStrip items={giftKpis} />
          </AdminAnalyticsChartPanel>
        </AdminAnalyticsPanelSection>
      </div>
    </div>
  );
}
