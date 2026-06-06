import type { AnalyticsSectionId } from "@/components/admin/admin-analytics-module";
import {
  parseAnalyticsBookingStatus,
  parseAnalyticsQuickFilters,
  parseAnalyticsRangeDays,
  parseAnalyticsSortKey,
  resolveQuickFiltersSort,
} from "@/components/admin/admin-analytics-helpers";
import type { AnalyticsFilterValues } from "@/components/admin/admin-analytics-types";

export const ANALYTICS_GLOBAL_QUERY_KEYS = ["rangeDays", "view", "quick", "sort"] as const;

export const ANALYTICS_BOOKINGS_QUERY_KEYS = [
  ...ANALYTICS_GLOBAL_QUERY_KEYS,
  "coachId",
  "classTypeId",
  "bookingStatus",
] as const;

export const ANALYTICS_COACHES_QUERY_KEYS = [
  ...ANALYTICS_GLOBAL_QUERY_KEYS,
  "coachId",
] as const;

export function getAnalyticsSectionQueryKeys(
  section: AnalyticsSectionId,
): readonly string[] {
  switch (section) {
    case "bookings":
      return ANALYTICS_BOOKINGS_QUERY_KEYS;
    case "coaches":
      return ANALYTICS_COACHES_QUERY_KEYS;
    case "overview":
    case "revenue":
    case "members":
      return ANALYTICS_GLOBAL_QUERY_KEYS;
  }
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function buildSanitizedAnalyticsSectionQueryString(
  section: AnalyticsSectionId,
  search: Record<string, string | string[] | undefined>,
): string {
  const allowed = new Set(getAnalyticsSectionQueryKeys(section));
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (!allowed.has(key)) {
      continue;
    }
    const normalized = firstParam(value);
    if (normalized !== undefined && normalized !== "") {
      params.set(key, normalized);
    }
  }
  return params.toString();
}

export function analyticsSectionSearchNeedsSanitization(
  section: AnalyticsSectionId,
  search: Record<string, string | string[] | undefined>,
): boolean {
  const allowed = new Set(getAnalyticsSectionQueryKeys(section));
  for (const [key, value] of Object.entries(search)) {
    if (value === undefined) {
      continue;
    }
    const normalized = firstParam(value);
    if (normalized === undefined || normalized === "") {
      continue;
    }
    if (!allowed.has(key)) {
      return true;
    }
  }
  return false;
}

export function normalizeAnalyticsSearch(
  search: Record<string, string | string[] | undefined>,
): Record<string, string | undefined> {
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(search)) {
    normalized[key] = Array.isArray(value) ? value[0] : value;
  }
  return normalized;
}

export function parseAnalyticsFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): AnalyticsFilterValues {
  const normalized = normalizeAnalyticsSearch(search);
  return {
    rangeDays: parseAnalyticsRangeDays(normalized.rangeDays),
    coachId: normalized.coachId ?? "",
    classTypeId: normalized.classTypeId ?? "",
    bookingStatus: parseAnalyticsBookingStatus(normalized.bookingStatus),
    sort: parseAnalyticsSortKey(normalized.sort),
    quick: normalized.quick ?? "",
  };
}

export function buildAnalyticsFiltersQuery(
  values: AnalyticsFilterValues,
  currentParams: URLSearchParams,
  section: AnalyticsSectionId,
): string {
  const params = new URLSearchParams();
  const view = currentParams.get("view");
  if (view) {
    params.set("view", view);
  }

  if (values.rangeDays !== 30) {
    params.set("rangeDays", String(values.rangeDays));
  }

  if (values.quick.trim()) {
    params.set("quick", values.quick);
  }

  if (values.sort !== "revenue-desc") {
    params.set("sort", values.sort);
  }

  if (section === "bookings" || section === "coaches") {
    if (values.coachId) {
      params.set("coachId", values.coachId);
    }
  }

  if (section === "bookings") {
    if (values.classTypeId) {
      params.set("classTypeId", values.classTypeId);
    }
    if (values.bookingStatus) {
      params.set("bookingStatus", values.bookingStatus);
    }
  }

  return params.toString();
}

export function applyAnalyticsIntegratedFilterChange(
  key: string,
  value: string,
  current: AnalyticsFilterValues,
): AnalyticsFilterValues {
  switch (key) {
    case "rangeDays":
      return { ...current, rangeDays: parseAnalyticsRangeDays(value) };
    case "coachId":
      return { ...current, coachId: value };
    case "classTypeId":
      return { ...current, classTypeId: value };
    case "bookingStatus":
      return { ...current, bookingStatus: parseAnalyticsBookingStatus(value) };
    case "sort":
      return { ...current, sort: parseAnalyticsSortKey(value) };
    case "quick": {
      const quickFilters = parseAnalyticsQuickFilters(value);
      const autoSort = resolveQuickFiltersSort(quickFilters);
      return {
        ...current,
        quick: value,
        sort: autoSort ?? current.sort,
      };
    }
    default:
      return current;
  }
}

export function defaultAnalyticsFilterValues(): AnalyticsFilterValues {
  return {
    rangeDays: 30,
    coachId: "",
    classTypeId: "",
    bookingStatus: "",
    sort: "revenue-desc",
    quick: "",
  };
}
