import { sortBarItems } from "@/components/admin/admin-analytics-helpers";
import {
  buildBookingStatusDonutItems,
  buildMemberSegmentBarItems,
  buildRevenueSourceBarItems,
  buildPaymentStatusBarItems,
} from "@/components/admin/admin-analytics-studio-map";
import type {
  AdminAnalyticsPayload,
  AnalyticsBarItem,
  AnalyticsSortKey,
} from "@/components/admin/admin-analytics-types";
import { formatAmdFromCents } from "@/lib/price-amd";

type RevenueSourceKey = "package" | "dropin" | "gift" | "other";

type AnalyticsChartLabels = {
  sources: Record<RevenueSourceKey, string>;
  bookingStatus: {
    booked: string;
    completed: string;
    cancelled: string;
    missed: string;
    waitlisted: string;
  };
  users: {
    active: string;
    vip: string;
    newMembers: string;
    returning: string;
    inactive30d: string;
  };
};

export function buildRevenueSourceItems(
  data: AdminAnalyticsPayload,
  sortKey: AnalyticsSortKey,
  sourceLabels: Record<RevenueSourceKey, string>,
): AnalyticsBarItem[] {
  return buildRevenueSourceBarItems(data.studio, sortKey, sourceLabels, data.locale);
}

export function buildPaymentStatusItems(
  data: AdminAnalyticsPayload,
  sortKey: AnalyticsSortKey,
): AnalyticsBarItem[] {
  return buildPaymentStatusBarItems(data.studio, sortKey, data.locale);
}

export function buildBookingStatusItems(
  data: AdminAnalyticsPayload,
  sortKey: AnalyticsSortKey,
  bookingStatusLabels: AnalyticsChartLabels["bookingStatus"],
): AnalyticsBarItem[] {
  return buildBookingStatusDonutItems(data.studio, sortKey, bookingStatusLabels);
}

export function buildMemberSegmentItems(
  data: AdminAnalyticsPayload,
  userLabels: AnalyticsChartLabels["users"],
): AnalyticsBarItem[] {
  return buildMemberSegmentBarItems(data.studio, userLabels);
}

export function buildAttendanceBarItems(
  data: AdminAnalyticsPayload,
  attendanceLabels: { completed: string; missed: string },
): AnalyticsBarItem[] {
  const status = data.studio.operations.bookingsByStatus;
  return [
    { key: "completed", label: attendanceLabels.completed, value: status.COMPLETED },
    { key: "missed", label: attendanceLabels.missed, value: status.MISSED },
  ];
}

export function buildCoachSessionsItems(
  data: AdminAnalyticsPayload,
  sortKey: AnalyticsSortKey,
): AnalyticsBarItem[] {
  const items = data.studio.coaches.rows.map((coach) => ({
    key: coach.id,
    label: coach.name,
    value: coach.sessions,
  }));
  return sortBarItems(items, sortKey).slice(0, 10);
}

export function resolveRangeAttendanceRate(data: AdminAnalyticsPayload): number | null {
  return data.studio.kpis.attendanceRate;
}

export function resolveTodayAttendanceRate(data: AdminAnalyticsPayload): number | null {
  return data.studio.kpis.attendanceRate;
}

export function sliceSortedBarItems(
  items: readonly AnalyticsBarItem[],
  sortKey: AnalyticsSortKey,
  limit = 10,
): AnalyticsBarItem[] {
  return sortBarItems([...items], sortKey).slice(0, limit);
}

export function formatAttributedRevenueLabel(amountCents: number, locale: string): string {
  return formatAmdFromCents(amountCents, locale);
}
