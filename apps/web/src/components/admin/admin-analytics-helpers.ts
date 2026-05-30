import type {
  AnalyticsBarItem,
  AnalyticsQuickFilter,
  AnalyticsRangeDays,
  AnalyticsSortKey,
  AnalyticsViewMode,
} from "@/components/admin/admin-analytics-types";

export const ANALYTICS_BOOKINGS_SAMPLE_LIMIT = 1000;

export function parseAnalyticsRangeDays(value?: string): AnalyticsRangeDays {
  const parsed = Number(value);
  if (parsed === 7 || parsed === 30 || parsed === 90) {
    return parsed;
  }
  return 30;
}

export function parseAnalyticsViewMode(value?: string): AnalyticsViewMode {
  return value === "chart" ? "chart" : "table";
}

export function parseAnalyticsSortKey(value?: string): AnalyticsSortKey {
  const allowed: AnalyticsSortKey[] = [
    "revenue-desc",
    "revenue-asc",
    "bookings-desc",
    "bookings-asc",
    "attendance-desc",
    "attendance-asc",
    "name-asc",
  ];
  if (value && allowed.includes(value as AnalyticsSortKey)) {
    return value as AnalyticsSortKey;
  }
  return "revenue-desc";
}

export function parseAnalyticsQuickFilter(value?: string): AnalyticsQuickFilter {
  const allowed: AnalyticsQuickFilter[] = ["none", "today", "week", "month", "last30"];
  if (value && allowed.includes(value as AnalyticsQuickFilter)) {
    return value as AnalyticsQuickFilter;
  }
  return "none";
}

export function resolveAnalyticsDateRange(input: {
  rangeDays: AnalyticsRangeDays;
  quickFilter: AnalyticsQuickFilter;
}): { fromIso: string; toIso: string; rangeDays: AnalyticsRangeDays } {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  if (input.quickFilter === "today") {
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);
    return { fromIso: from.toISOString(), toIso: to.toISOString(), rangeDays: 7 };
  }

  const days =
    input.quickFilter === "week"
      ? 7
      : input.quickFilter === "month" || input.quickFilter === "last30"
        ? 30
        : input.rangeDays;

  const from = new Date(now);
  from.setDate(from.getDate() - days + 1);
  from.setHours(0, 0, 0, 0);
  return {
    fromIso: from.toISOString(),
    toIso: to.toISOString(),
    rangeDays: days === 7 ? 7 : days === 90 ? 90 : 30,
  };
}

export function sortBarItems(
  items: AnalyticsBarItem[],
  sortKey: AnalyticsSortKey,
): AnalyticsBarItem[] {
  const copy = [...items];
  switch (sortKey) {
    case "revenue-desc":
    case "bookings-desc":
      return copy.sort((a, b) => b.value - a.value);
    case "revenue-asc":
    case "bookings-asc":
      return copy.sort((a, b) => a.value - b.value);
    case "attendance-desc":
      return copy.sort((a, b) => b.value - a.value);
    case "attendance-asc":
      return copy.sort((a, b) => a.value - b.value);
    case "name-asc":
      return copy.sort((a, b) => a.label.localeCompare(b.label));
    default:
      return copy;
  }
}

export function countMembershipStatuses(
  rows: Array<{ status: string; plan: { name: string } }>,
): Array<{ status: string; count: number }> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

export function countMembershipPlans(
  rows: Array<{ plan: { name: string } }>,
): AnalyticsBarItem[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.plan.name, (counts.get(row.plan.name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ key: label, label, value }))
    .sort((a, b) => b.value - a.value);
}

export function buildClassPopularity(
  rows: Array<{ session: { classType: { id: string; name: string } } }>,
): AnalyticsBarItem[] {
  const counts = new Map<string, { label: string; value: number }>();
  for (const row of rows) {
    const id = row.session.classType.id;
    const label = row.session.classType.name;
    const prev = counts.get(id) ?? { label, value: 0 };
    prev.value += 1;
    counts.set(id, prev);
  }
  return [...counts.entries()].map(([key, entry]) => ({
    key,
    label: entry.label,
    value: entry.value,
  }));
}

export function buildCoachBookings(
  rows: Array<{ session: { coach: { id: string; name: string | null } } }>,
): AnalyticsBarItem[] {
  const counts = new Map<string, { label: string; value: number }>();
  for (const row of rows) {
    const id = row.session.coach.id;
    const label = row.session.coach.name ?? id;
    const prev = counts.get(id) ?? { label, value: 0 };
    prev.value += 1;
    counts.set(id, prev);
  }
  return [...counts.entries()].map(([key, entry]) => ({
    key,
    label: entry.label,
    value: entry.value,
  }));
}

export function computeAttendanceRate(completed: number, missed: number): number | null {
  const total = completed + missed;
  if (total <= 0) {
    return null;
  }
  return Math.round((completed / total) * 100);
}
