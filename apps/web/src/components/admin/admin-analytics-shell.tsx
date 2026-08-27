"use client";

import { AdminAnalyticsBookingsPanel } from "@/components/admin/admin-analytics-bookings-panel";
import { AdminAnalyticsCoachesPanel } from "@/components/admin/admin-analytics-coaches-panel";
import { AdminAnalyticsMembersPanel } from "@/components/admin/admin-analytics-members-panel";
import { AdminAnalyticsOverviewPanel } from "@/components/admin/admin-analytics-overview-panel";
import { AdminAnalyticsRevenuePanel } from "@/components/admin/admin-analytics-revenue-panel";
import type { AnalyticsSectionId } from "@/components/admin/admin-analytics-module";
import type { AdminAnalyticsPayload } from "@/components/admin/admin-analytics-types";

type AdminAnalyticsShellProps = {
  data: AdminAnalyticsPayload;
  section: AnalyticsSectionId;
  includeFinance?: boolean;
};

export function AdminAnalyticsShell({
  data,
  section,
  includeFinance = true,
}: AdminAnalyticsShellProps) {
  switch (section) {
    case "overview":
      return <AdminAnalyticsOverviewPanel data={data} includeFinance={includeFinance} />;
    case "revenue":
      return includeFinance ? <AdminAnalyticsRevenuePanel data={data} /> : null;
    case "bookings":
      return <AdminAnalyticsBookingsPanel data={data} />;
    case "members":
      return <AdminAnalyticsMembersPanel data={data} />;
    case "coaches":
      return <AdminAnalyticsCoachesPanel data={data} />;
  }
}
