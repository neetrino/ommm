import type { AnalyticsBarItem } from "@/components/admin/admin-analytics-types";
import type { DashboardStudioPaymentDueItem } from "@/components/admin/admin-dashboard-payment-due";

export type DashboardBookingStatus = "BOOKED" | "COMPLETED" | "CANCELLED" | "MISSED";

export type DashboardOverview = {
  sessionsToday: number;
  bookingsToday: number;
  activeWaitlists: number;
  activeMembers: number;
  revenueCentsTotal?: number;
  bookingsByStatus?: Record<DashboardBookingStatus, number>;
  upcomingClasses?: Array<{
    id: string;
    className: string;
    startsAt: string;
    coachName: string;
    bookedCount: number;
    capacity: number;
    status: string;
  }>;
  revenue?: {
    todayRevenueCents: number;
    monthRevenueCents: number;
    pendingPaymentsCents: number;
    pendingPaymentsCount: number;
    trendPercent: number | null;
  };
  upcomingCancellations?: Array<{
    id: string;
    type: "booking" | "package";
    userName: string;
    itemName: string;
    dateTime: string;
    status: string;
  }>;
  newUsers?: {
    todayCount: number;
    recent: Array<{
      id: string;
      name: string;
      email: string;
      createdAt: string;
    }>;
  };
  studioPaymentDue?: {
    count: number;
    items: DashboardStudioPaymentDueItem[];
  };
  alerts?: Array<{
    code: string;
    level: "info" | "warning";
    count: number;
  }>;
};

export function buildTodayBookingItems(
  bookingsByStatus: Record<DashboardBookingStatus, number>,
  labels: Record<DashboardBookingStatus, string>,
): AnalyticsBarItem[] {
  return (["BOOKED", "COMPLETED", "CANCELLED", "MISSED"] as const).map((key) => ({
    key,
    label: labels[key],
    value: bookingsByStatus[key],
  }));
}

export function buildRevenueTrendKpi(
  trendPercent: number | null,
  unavailableLabel: string,
) {
  if (trendPercent === null) {
    return { value: unavailableLabel, valueTone: "default" as const };
  }
  if (trendPercent > 0) {
    return { value: `+${trendPercent}%`, valueTone: "positive" as const };
  }
  if (trendPercent < 0) {
    return { value: `${trendPercent}%`, valueTone: "negative" as const };
  }
  return { value: "0%", valueTone: "default" as const };
}

export function dashboardClientsHref(includeFinance: boolean): string {
  return includeFinance ? "/admin/clients" : "/manager/clients";
}
