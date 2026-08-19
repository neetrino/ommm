import { sortBarItems } from "@/components/admin/admin-analytics-helpers";
import type {
  AnalyticsBarItem,
  AnalyticsDailyBucket,
  AnalyticsSortKey,
  StudioAnalyticsPayload,
} from "@/components/admin/admin-analytics-types";
import { formatAmdFromCents } from "@/lib/price-amd";

type RevenueSourceKey = "package" | "dropin" | "gift" | "other";

export function buildDailyTrendFromStudio(
  studio: StudioAnalyticsPayload,
  locale: string,
): AnalyticsDailyBucket[] {
  const labelFormatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });
  return studio.daily.map((day) => ({
    dateKey: day.dateKey,
    label: labelFormatter.format(new Date(`${day.dateKey}T12:00:00`)),
    total: day.bookings,
    completed: day.completed,
    revenueCents: day.revenueCents,
    occupancyRate: day.occupancyRate,
    cancelled: day.cancelled,
    missed: day.missed,
  }));
}

export function buildRevenueSourceBarItems(
  studio: StudioAnalyticsPayload,
  sortKey: AnalyticsSortKey,
  sourceLabels: Record<RevenueSourceKey, string>,
  locale: string,
): AnalyticsBarItem[] {
  const items = (["package", "dropin", "gift", "other"] as const).map((key) => ({
    key,
    label: sourceLabels[key],
    value: studio.revenue.bySource[key].amountCents,
    displayValue: formatAmdFromCents(studio.revenue.bySource[key].amountCents, locale),
  }));
  return sortBarItems(items, sortKey);
}

export function buildPaymentStatusBarItems(
  studio: StudioAnalyticsPayload,
  sortKey: AnalyticsSortKey,
  locale: string,
): AnalyticsBarItem[] {
  const items = studio.revenue.byStatus.map((entry) => ({
    key: entry.status,
    label: entry.status,
    value: entry.amountCents,
    displayValue: `${formatAmdFromCents(entry.amountCents, locale)} (${entry.count})`,
  }));
  return sortBarItems(items, sortKey);
}

export function buildPaymentMethodBarItems(
  studio: StudioAnalyticsPayload,
  sortKey: AnalyticsSortKey,
  methodLabels: Record<string, string>,
  locale: string,
): AnalyticsBarItem[] {
  const items = studio.revenue.byPaymentMethod.map((entry) => ({
    key: entry.method,
    label: methodLabels[entry.method] ?? entry.method,
    value: entry.amountCents,
    displayValue: `${formatAmdFromCents(entry.amountCents, locale)} (${entry.count})`,
  }));
  return sortBarItems(items, sortKey);
}

export function buildAttributedClassRevenueItems(
  studio: StudioAnalyticsPayload,
  sortKey: AnalyticsSortKey,
  locale: string,
): AnalyticsBarItem[] {
  const items = studio.revenue.byClassType.map((entry) => ({
    key: entry.id,
    label: entry.label,
    value: entry.amountCents,
    displayValue: formatAmdFromCents(entry.amountCents, locale),
  }));
  return sortBarItems(items, sortKey);
}

export function buildAttributedCoachRevenueItems(
  studio: StudioAnalyticsPayload,
  sortKey: AnalyticsSortKey,
  locale: string,
): AnalyticsBarItem[] {
  const items = studio.revenue.byCoach.map((entry) => ({
    key: entry.id,
    label: entry.label,
    value: entry.amountCents,
    displayValue: formatAmdFromCents(entry.amountCents, locale),
  }));
  return sortBarItems(items, sortKey);
}

export function buildClassPopularityBarItems(
  studio: StudioAnalyticsPayload,
  sortKey: AnalyticsSortKey,
): AnalyticsBarItem[] {
  const items = studio.operations.classPopularity.map((entry) => ({
    key: entry.id,
    label: entry.label,
    value: entry.bookings,
  }));
  return sortBarItems(items, sortKey);
}

export function buildClassOccupancyBarItems(
  studio: StudioAnalyticsPayload,
  sortKey: AnalyticsSortKey,
  notAvailable: string,
): AnalyticsBarItem[] {
  const items = studio.operations.classPopularity.map((entry) => ({
    key: entry.id,
    label: entry.label,
    value: entry.occupancyRate ?? 0,
    displayValue:
      entry.occupancyRate === null ? notAvailable : `${entry.occupancyRate}%`,
  }));
  return sortBarItems(items, sortKey);
}

export function buildCoachMetricBarItems(
  studio: StudioAnalyticsPayload,
  sortKey: AnalyticsSortKey,
  metric: "bookings" | "attendance" | "occupancy" | "revenue" | "sessions",
  locale: string,
  notAvailable: string,
): AnalyticsBarItem[] {
  const items = studio.coaches.rows.map((row) => {
    if (metric === "bookings") {
      return { key: row.id, label: row.name, value: row.bookings };
    }
    if (metric === "sessions") {
      return { key: row.id, label: row.name, value: row.sessions };
    }
    if (metric === "revenue") {
      return {
        key: row.id,
        label: row.name,
        value: row.revenueCents,
        displayValue: formatAmdFromCents(row.revenueCents, locale),
      };
    }
    const rate = metric === "attendance" ? row.attendanceRate : row.occupancyRate;
    return {
      key: row.id,
      label: row.name,
      value: rate ?? 0,
      displayValue: rate === null ? notAvailable : `${rate}%`,
    };
  });
  return sortBarItems(items, sortKey);
}

export function buildBookingStatusDonutItems(
  studio: StudioAnalyticsPayload,
  sortKey: AnalyticsSortKey,
  labels: {
    booked: string;
    completed: string;
    cancelled: string;
    missed: string;
    waitlisted: string;
  },
): AnalyticsBarItem[] {
  const status = studio.operations.bookingsByStatus;
  const items = [
    { key: "booked", label: labels.booked, value: status.BOOKED },
    { key: "completed", label: labels.completed, value: status.COMPLETED },
    { key: "cancelled", label: labels.cancelled, value: status.CANCELLED },
    { key: "missed", label: labels.missed, value: status.MISSED },
    { key: "waitlisted", label: labels.waitlisted, value: status.waitlisted },
  ];
  return sortBarItems(items, sortKey);
}

export function buildMemberSegmentBarItems(
  studio: StudioAnalyticsPayload,
  labels: {
    newMembers: string;
    returning: string;
    inactive30d: string;
    active: string;
    vip: string;
  },
): AnalyticsBarItem[] {
  return [
    { key: "new", label: labels.newMembers, value: studio.members.newInRange },
    { key: "returning", label: labels.returning, value: studio.members.returningInRange },
    { key: "inactive30d", label: labels.inactive30d, value: studio.members.inactive30d },
    { key: "active", label: labels.active, value: studio.members.active },
    { key: "vip", label: labels.vip, value: studio.members.vip },
  ];
}

export function buildPackageHealthBarItems(
  studio: StudioAnalyticsPayload,
  labels: {
    active: string;
    paused: string;
    expiring7d: string;
    expiredInRange: string;
  },
): AnalyticsBarItem[] {
  const packages = studio.members.packages;
  return [
    { key: "active", label: labels.active, value: packages.active },
    { key: "paused", label: labels.paused, value: packages.paused },
    { key: "expiring7d", label: labels.expiring7d, value: packages.expiring7d },
    { key: "expiredInRange", label: labels.expiredInRange, value: packages.expiredInRange },
  ];
}

export function buildChannelBarItems(
  studio: StudioAnalyticsPayload,
  labels: { website: string; app: string },
): AnalyticsBarItem[] {
  return [
    { key: "WEBSITE", label: labels.website, value: studio.operations.channels.WEBSITE },
    { key: "APP", label: labels.app, value: studio.operations.channels.APP },
  ];
}

export function buildWaitlistSnapshotItems(
  studio: StudioAnalyticsPayload,
  labels: {
    active: string;
    offered: string;
    converted: string;
    conversionRate: string;
  },
  notAvailable: string,
): AnalyticsBarItem[] {
  const waitlist = studio.operations.waitlist;
  return [
    { key: "active", label: labels.active, value: waitlist.active },
    { key: "offered", label: labels.offered, value: waitlist.offered },
    { key: "converted", label: labels.converted, value: waitlist.converted },
    {
      key: "conversionRate",
      label: labels.conversionRate,
      value: waitlist.conversionRate ?? 0,
      displayValue:
        waitlist.conversionRate === null ? notAvailable : `${waitlist.conversionRate}%`,
    },
  ];
}

export function buildPeakWeekdayColumnData(
  studio: StudioAnalyticsPayload,
  weekdayLabels: readonly string[],
) {
  return studio.operations.peakWeekdays.map((entry) => ({
    label: weekdayLabels[entry.weekday] ?? String(entry.weekday),
    tooltipLabel: weekdayLabels[entry.weekday] ?? String(entry.weekday),
    bookings: entry.bookings,
  }));
}

export function buildPeakHourColumnData(studio: StudioAnalyticsPayload) {
  return studio.operations.peakHours.map((entry) => ({
    label: `${String(entry.hour).padStart(2, "0")}:00`,
    tooltipLabel: `${String(entry.hour).padStart(2, "0")}:00`,
    bookings: entry.bookings,
  }));
}

export function formatTrendDelta(trendPercent: number | null): string | null {
  if (trendPercent === null) {
    return null;
  }
  const rounded = Math.round(trendPercent);
  if (rounded > 0) {
    return `+${rounded}%`;
  }
  if (rounded < 0) {
    return `${rounded}%`;
  }
  return "0%";
}

export function formatRatePercent(rate: number | null, notAvailable: string): string {
  return rate === null ? notAvailable : `${rate}%`;
}
