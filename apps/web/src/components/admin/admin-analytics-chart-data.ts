import {
  computeAttendanceRate,
  sortBarItems,
} from "@/components/admin/admin-analytics-helpers";
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
    atRisk: string;
  };
  attendance: {
    completed: string;
    missed: string;
  };
};

export function buildRevenueSourceItems(
  data: AdminAnalyticsPayload,
  sortKey: AnalyticsSortKey,
  sourceLabels: Record<RevenueSourceKey, string>,
): AnalyticsBarItem[] {
  const items = (["package", "dropin", "gift", "other"] as const).map((key) => ({
    key,
    label: sourceLabels[key],
    value: data.finance.bySource[key].amountCents,
    displayValue: formatAmdFromCents(data.finance.bySource[key].amountCents, data.locale),
  }));
  return sortBarItems(items, sortKey);
}

export function buildPaymentStatusItems(
  data: AdminAnalyticsPayload,
  sortKey: AnalyticsSortKey,
): AnalyticsBarItem[] {
  const items = data.finance.byStatus.map((entry) => ({
    key: entry.status,
    label: entry.status,
    value: entry.amountCents,
    displayValue: `${formatAmdFromCents(entry.amountCents, data.locale)} (${entry.count})`,
  }));
  return sortBarItems(items, sortKey);
}

export function buildBookingStatusItems(
  data: AdminAnalyticsPayload,
  sortKey: AnalyticsSortKey,
  bookingStatusLabels: AnalyticsChartLabels["bookingStatus"],
): AnalyticsBarItem[] {
  const summary = data.bookings.summary;
  const items = [
    { key: "booked", label: bookingStatusLabels.booked, value: summary.booked },
    { key: "completed", label: bookingStatusLabels.completed, value: summary.completed },
    { key: "cancelled", label: bookingStatusLabels.cancelled, value: summary.cancelled },
    { key: "missed", label: bookingStatusLabels.missed, value: summary.missed },
    { key: "waitlisted", label: bookingStatusLabels.waitlisted, value: summary.waitlisted },
  ];
  return sortBarItems(items, sortKey);
}

export function buildMemberSegmentItems(
  data: AdminAnalyticsPayload,
  userLabels: AnalyticsChartLabels["users"],
): AnalyticsBarItem[] {
  return [
    { key: "active", label: userLabels.active, value: data.clients.active },
    { key: "vip", label: userLabels.vip, value: data.clients.vip },
    { key: "atRisk", label: userLabels.atRisk, value: data.clients.atRisk },
  ];
}

export function buildAttendanceBarItems(
  data: AdminAnalyticsPayload,
  attendanceLabels: AnalyticsChartLabels["attendance"],
): AnalyticsBarItem[] {
  return [
    {
      key: "completed",
      label: attendanceLabels.completed,
      value: data.bookings.summary.completed,
    },
    {
      key: "missed",
      label: attendanceLabels.missed,
      value: data.bookings.summary.missed,
    },
  ];
}

export function buildCoachSessionsItems(
  data: AdminAnalyticsPayload,
  sortKey: AnalyticsSortKey,
): AnalyticsBarItem[] {
  const items = data.coaches.map((coach) => ({
    key: coach.id,
    label: [coach.user.name, coach.user.lastName].filter(Boolean).join(" ") || coach.user.email,
    value: coach.totalClasses,
  }));
  return sortBarItems(items, sortKey).slice(0, 10);
}

export function resolveRangeAttendanceRate(data: AdminAnalyticsPayload): number | null {
  return computeAttendanceRate(data.bookings.summary.completed, data.bookings.summary.missed);
}

export function resolveTodayAttendanceRate(data: AdminAnalyticsPayload): number | null {
  const todayStatus = data.dashboard.bookingsByStatus;
  if (todayStatus === undefined) {
    return null;
  }
  return computeAttendanceRate(todayStatus.COMPLETED, todayStatus.MISSED);
}

export function sliceSortedBarItems(
  items: readonly AnalyticsBarItem[],
  sortKey: AnalyticsSortKey,
  limit = 10,
): AnalyticsBarItem[] {
  return sortBarItems([...items], sortKey).slice(0, limit);
}
