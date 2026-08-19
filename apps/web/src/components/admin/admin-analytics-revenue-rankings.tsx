"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminAnalyticsChartPanel } from "@/components/admin/admin-analytics-chart-panel";
import { AdminAnalyticsPanelSection } from "@/components/admin/admin-analytics-panel-motion";
import {
  buildClassTypeRankRows,
  buildPackageSalesRankRows,
  buildTopClientRankRows,
} from "@/components/admin/admin-analytics-finance-map";
import { AnalyticsRankTable } from "@/components/admin/admin-analytics-shared-ui";
import type { AdminAnalyticsPayload } from "@/components/admin/admin-analytics-types";

type AdminAnalyticsRevenueRankingsProps = {
  data: AdminAnalyticsPayload;
};

export function AdminAnalyticsRevenueRankings({ data }: AdminAnalyticsRevenueRankingsProps) {
  const t = useTranslations("adminPages.analytics");
  const studio = data.studio;
  const locale = data.locale;
  const unassigned = t("unassignedClassType");

  const packageRows = useMemo(
    () => buildPackageSalesRankRows(studio, locale),
    [locale, studio],
  );
  const clientRows = useMemo(
    () => buildTopClientRankRows(studio, locale),
    [locale, studio],
  );
  const classRows = useMemo(
    () => buildClassTypeRankRows(studio, locale, unassigned),
    [locale, studio, unassigned],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <AdminAnalyticsPanelSection index={6}>
        <AdminAnalyticsChartPanel
          title={t("sections.packageSales.tableTitle")}
          hint={t("sections.packageSales.hint")}
        >
          <AnalyticsRankTable
            rows={packageRows}
            labels={{
              rank: t("table.rank"),
              name: t("table.name"),
              count: t("table.amount"),
              secondary: t("table.units"),
            }}
          />
        </AdminAnalyticsChartPanel>
      </AdminAnalyticsPanelSection>
      <AdminAnalyticsPanelSection index={7}>
        <AdminAnalyticsChartPanel
          title={t("sections.topClients.title")}
          hint={t("sections.topClients.hint")}
        >
          <AnalyticsRankTable
            rows={clientRows}
            labels={{
              rank: t("table.rank"),
              name: t("table.name"),
              count: t("table.amount"),
              secondary: t("table.payments"),
            }}
          />
        </AdminAnalyticsChartPanel>
      </AdminAnalyticsPanelSection>
      <AdminAnalyticsPanelSection index={8}>
        <AdminAnalyticsChartPanel
          title={t("sections.classRevenue.tableTitle")}
          hint={t("sections.classRevenue.salesHint")}
        >
          <AnalyticsRankTable
            rows={classRows}
            labels={{
              rank: t("table.rank"),
              name: t("table.name"),
              count: t("table.amount"),
              secondary: t("table.bookings"),
            }}
          />
        </AdminAnalyticsChartPanel>
      </AdminAnalyticsPanelSection>
    </div>
  );
}
