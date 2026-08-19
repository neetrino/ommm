import type { AnalyticsDailyBucket } from "@/components/admin/admin-analytics-types";

export const ANALYTICS_CHART_BLUE = "#2563eb";
export const ANALYTICS_CHART_INK = "#434843";

export function mapDailyTrendForChart(dailyTrend: AnalyticsDailyBucket[]) {
  return dailyTrend.map((point) => ({
    label: point.label,
    revenue: point.revenueCents,
    bookings: point.total,
    completed: point.completed,
    occupancy: point.occupancyRate ?? 0,
  }));
}
