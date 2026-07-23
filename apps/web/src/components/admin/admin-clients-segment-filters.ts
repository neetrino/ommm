export const ADMIN_CLIENT_SEGMENT_FILTER_VALUES = [
  "new",
  "vip",
  "unpaid",
  "birthday-this-month",
  "inactive-30-days",
  "no-show",
] as const;

export type AdminClientSegmentFilter = (typeof ADMIN_CLIENT_SEGMENT_FILTER_VALUES)[number];

const SEGMENT_FILTER_SET = new Set<string>(ADMIN_CLIENT_SEGMENT_FILTER_VALUES);

export function isAdminClientSegmentFilter(value: string): value is AdminClientSegmentFilter {
  return SEGMENT_FILTER_SET.has(value);
}

/** Parses comma-separated `quick` URL values into validated segment filters. */
export function parseAdminClientSegmentFilters(value: string): AdminClientSegmentFilter[] {
  if (!value.trim()) {
    return [];
  }
  const seen = new Set<AdminClientSegmentFilter>();
  const parsed: AdminClientSegmentFilter[] = [];
  for (const part of value.split(",")) {
    const trimmed = part.trim();
    if (isAdminClientSegmentFilter(trimmed) && !seen.has(trimmed)) {
      seen.add(trimmed);
      parsed.push(trimmed);
    }
  }
  return parsed;
}

/** Serializes selected segment filters for the `quick` URL param. */
export function serializeAdminClientSegmentFilters(
  values: readonly AdminClientSegmentFilter[],
): string {
  return values.join(",");
}
