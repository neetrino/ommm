/** URL filter keys synced with `AdminListClientsQueryDto` (excluding `meta`). */
export const ADMIN_CLIENTS_FILTER_KEYS = [
  "search",
  "tag",
  "status",
  "classLevel",
  "paymentStatus",
  "source",
  "preferredCoachId",
  "attendance",
  "birthdayMonth",
  "order",
  "quick",
] as const;

const ADMIN_CLIENTS_API_QUERY_KEYS = [
  ...ADMIN_CLIENTS_FILTER_KEYS,
  "q",
  "take",
  "offset",
] as const;

/** UI-only query keys kept in the URL but not sent to `GET /clients`. */
export const ADMIN_CLIENTS_UI_QUERY_KEYS = ["viewClient"] as const;

export const VIEW_CLIENT_QUERY_KEY = "viewClient";

export function buildAdminClientsApiSearchParams(
  search: Record<string, string | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("meta", "true");
  for (const key of ADMIN_CLIENTS_API_QUERY_KEYS) {
    const value = search[key];
    if (value) {
      params.set(key, value);
    }
  }
  return params;
}

export function pickAdminClientsInitialFilters(
  search: Record<string, string | undefined>,
): Record<string, string> {
  const filters: Record<string, string> = {};
  for (const key of ADMIN_CLIENTS_FILTER_KEYS) {
    const value = search[key];
    if (value) {
      filters[key] = value;
    }
  }
  return filters;
}

export function mergeAdminClientsUrlQuery(
  filterQuery: string,
  uiSearch: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams(filterQuery);
  for (const key of ADMIN_CLIENTS_UI_QUERY_KEYS) {
    const value = uiSearch[key];
    if (value) {
      params.set(key, value);
    }
  }
  return params.toString();
}

/** Compares query strings by key/value pairs (order-independent). */
export function areUrlSearchQueriesEqual(a: string, b: string): boolean {
  const paramsA = new URLSearchParams(a);
  const paramsB = new URLSearchParams(b);
  const keysA = [...new Set(paramsA.keys())].sort();
  const keysB = [...new Set(paramsB.keys())].sort();
  if (keysA.length !== keysB.length) {
    return false;
  }
  return keysA.every((key, index) => {
    return key === keysB[index] && paramsA.get(key) === paramsB.get(key);
  });
}
