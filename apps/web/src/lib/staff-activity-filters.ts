import type { StaffActivityType } from "@/lib/staff-activity-types";
import { parseFilterMultiValue } from "@/lib/filter-multi-value";

export const STAFF_ACTIVITY_SEARCH_QUERY_KEY = "q";
export const STAFF_ACTIVITY_TYPE_QUERY_KEY = "type";
export const STAFF_ACTIVITY_TYPE_ALL_QUERY_VALUE = "all";
export const STAFF_ACTIVITY_TYPE_FILTER_KEY = "type";

export const STAFF_ACTIVITY_TYPE_FILTERS = [
  "BOOKING_CREATED",
  "BOOKING_CANCELLED",
] as const satisfies readonly StaffActivityType[];

export type StaffActivityTypeFilter =
  (typeof STAFF_ACTIVITY_TYPE_FILTERS)[number];

const TYPE_VALUES = new Set<string>(STAFF_ACTIVITY_TYPE_FILTERS);

/** Returns CSV of allowed types, or "" when none selected. */
export function parseStaffActivityTypeFilter(
  value: string | null | undefined,
): string {
  const selected = parseFilterMultiValue(value).filter((part) => TYPE_VALUES.has(part));
  return selected.join(",");
}

export function staffActivityTypeToQueryValue(typeCsv: string): string {
  const selected = parseFilterMultiValue(typeCsv);
  return selected.length > 0 ? selected.join(",") : STAFF_ACTIVITY_TYPE_ALL_QUERY_VALUE;
}

export function buildStaffActivityListEndpoint(params: {
  take: number;
  offset: number;
  q?: string;
  type?: string;
}): string {
  const query = new URLSearchParams({
    take: String(params.take),
    offset: String(params.offset),
  });
  const q = params.q?.trim() ?? "";
  if (q.length > 0) {
    query.set(STAFF_ACTIVITY_SEARCH_QUERY_KEY, q);
  }
  const types = parseFilterMultiValue(params.type);
  if (types.length > 0) {
    query.set(STAFF_ACTIVITY_TYPE_QUERY_KEY, types.join(","));
  }
  return `/staff-activity?${query.toString()}`;
}
