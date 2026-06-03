import type {
  AnalyticsBarItem,
  AnalyticsBookingStatusFilter,
  AnalyticsQuickFilterOption,
  AnalyticsRangeDays,
  AnalyticsSortKey,
  AnalyticsViewMode,
} from "@/components/admin/admin-analytics-types";

export const ANALYTICS_BOOKINGS_SAMPLE_LIMIT = 1000;

export const ANALYTICS_QUICK_FILTER_VALUES: readonly AnalyticsQuickFilterOption[] = [
  "today",
  "week",
  "month",
  "last30",
  "topCoaches",
  "popularClasses",
];

const ANALYTICS_QUICK_FILTER_SET = new Set<string>(ANALYTICS_QUICK_FILTER_VALUES);

const ANALYTICS_DATE_QUICK_FILTERS: readonly AnalyticsQuickFilterOption[] = [
  "today",
  "week",
  "month",
  "last30",
];

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

function isAnalyticsQuickFilterOption(value: string): value is AnalyticsQuickFilterOption {
  return ANALYTICS_QUICK_FILTER_SET.has(value);
}

/** Parses comma-separated `quick` URL values. Empty array means all options are selected. */
export function parseAnalyticsQuickFilters(value?: string): AnalyticsQuickFilterOption[] {
  if (!value?.trim() || value === "none") {
    return [];
  }

  const seen = new Set<AnalyticsQuickFilterOption>();
  const parsed: AnalyticsQuickFilterOption[] = [];
  for (const part of value.split(",")) {
    const trimmed = part.trim();
    if (isAnalyticsQuickFilterOption(trimmed) && !seen.has(trimmed)) {
      seen.add(trimmed);
      parsed.push(trimmed);
    }
  }

  if (parsed.length === 0 && isAnalyticsQuickFilterOption(value.trim())) {
    return [value.trim() as AnalyticsQuickFilterOption];
  }

  return parsed;
}

/** Serializes selected quick filters for the `quick` URL param. Empty string means all selected. */
export function serializeAnalyticsQuickFilters(
  values: readonly AnalyticsQuickFilterOption[],
): string {
  return values.join(",");
}

export function parseAnalyticsBookingStatus(value?: string): AnalyticsBookingStatusFilter {
  const allowed: AnalyticsBookingStatusFilter[] = [
    "",
    "BOOKED",
    "COMPLETED",
    "CANCELLED",
    "MISSED",
  ];
  if (value && allowed.includes(value as AnalyticsBookingStatusFilter)) {
    return value as AnalyticsBookingStatusFilter;
  }
  return "";
}

export function resolveQuickFiltersSort(
  quickFilters: readonly AnalyticsQuickFilterOption[],
): AnalyticsSortKey | null {
  if (quickFilters.length === 0) {
    return null;
  }
  if (quickFilters.includes("topCoaches") || quickFilters.includes("popularClasses")) {
    return "bookings-desc";
  }
  return null;
}

function quickFilterDateBreadthDays(filter: AnalyticsQuickFilterOption): number {
  if (filter === "today") {
    return 1;
  }
  if (filter === "week") {
    return 7;
  }
  return 30;
}

function resolveRangeDaysFromBreadth(breadthDays: number): AnalyticsRangeDays {
  if (breadthDays <= 7) {
    return 7;
  }
  if (breadthDays >= 90) {
    return 90;
  }
  return 30;
}

function buildDateRangeFromDays(
  rangeDays: AnalyticsRangeDays,
  now: Date,
  to: Date,
): { fromIso: string; toIso: string; rangeDays: AnalyticsRangeDays } {
  const from = new Date(now);
  from.setDate(from.getDate() - rangeDays + 1);
  from.setHours(0, 0, 0, 0);
  return {
    fromIso: from.toISOString(),
    toIso: to.toISOString(),
    rangeDays,
  };
}

export function resolveAnalyticsDateRange(input: {
  rangeDays: AnalyticsRangeDays;
  quickFilters: readonly AnalyticsQuickFilterOption[];
}): { fromIso: string; toIso: string; rangeDays: AnalyticsRangeDays } {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  const selectedDateFilters = input.quickFilters.filter((filter) =>
    ANALYTICS_DATE_QUICK_FILTERS.includes(filter),
  );

  if (input.quickFilters.length === 0 || selectedDateFilters.length === 0) {
    return buildDateRangeFromDays(input.rangeDays, now, to);
  }

  const breadthDays = selectedDateFilters.reduce(
    (max, filter) => Math.max(max, quickFilterDateBreadthDays(filter)),
    0,
  );

  if (breadthDays === 1) {
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);
    return { fromIso: from.toISOString(), toIso: to.toISOString(), rangeDays: 7 };
  }

  const resolvedRangeDays = resolveRangeDaysFromBreadth(breadthDays);
  return buildDateRangeFromDays(resolvedRangeDays, now, to);
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

export function buildCoachAttendance(
  rows: Array<{
    status: string;
    session: { coach: { id: string; name: string | null } };
  }>,
): AnalyticsBarItem[] {
  const counts = new Map<string, { label: string; completed: number; missed: number }>();
  for (const row of rows) {
    if (row.status !== "COMPLETED" && row.status !== "MISSED") {
      continue;
    }
    const id = row.session.coach.id;
    const label = row.session.coach.name ?? id;
    const prev = counts.get(id) ?? { label, completed: 0, missed: 0 };
    if (row.status === "COMPLETED") {
      prev.completed += 1;
    } else {
      prev.missed += 1;
    }
    counts.set(id, prev);
  }
  return [...counts.entries()].map(([key, entry]) => {
    const rate = computeAttendanceRate(entry.completed, entry.missed);
    const total = entry.completed + entry.missed;
    return {
      key,
      label: entry.label,
      value: rate ?? 0,
      displayValue:
        rate === null ? "N/A" : `${rate}% (${entry.completed}/${total})`,
    };
  });
}

export function computeAttendanceRate(completed: number, missed: number): number | null {
  const total = completed + missed;
  if (total <= 0) {
    return null;
  }
  return Math.round((completed / total) * 100);
}
