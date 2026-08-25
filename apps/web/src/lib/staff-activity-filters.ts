import type { StaffActivityType } from "@/lib/staff-activity-types";

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

export function parseStaffActivityTypeFilter(
  value: string | null | undefined,
): StaffActivityTypeFilter | "" {
  const raw = value?.trim();
  if (!raw || raw === STAFF_ACTIVITY_TYPE_ALL_QUERY_VALUE) {
    return "";
  }
  return STAFF_ACTIVITY_TYPE_FILTERS.includes(raw as StaffActivityTypeFilter)
    ? (raw as StaffActivityTypeFilter)
    : "";
}

export function staffActivityTypeToQueryValue(
  type: StaffActivityTypeFilter | "",
): string {
  return type.length > 0 ? type : STAFF_ACTIVITY_TYPE_ALL_QUERY_VALUE;
}

export function buildStaffActivityListEndpoint(params: {
  take: number;
  offset: number;
  q?: string;
  type?: StaffActivityTypeFilter | "";
}): string {
  const query = new URLSearchParams({
    take: String(params.take),
    offset: String(params.offset),
  });
  const q = params.q?.trim() ?? "";
  if (q.length > 0) {
    query.set(STAFF_ACTIVITY_SEARCH_QUERY_KEY, q);
  }
  if (params.type) {
    query.set(STAFF_ACTIVITY_TYPE_QUERY_KEY, params.type);
  }
  return `/staff-activity?${query.toString()}`;
}
