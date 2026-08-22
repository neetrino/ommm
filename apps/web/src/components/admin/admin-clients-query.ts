import {
  LIST_PAGE_QUERY_KEY,
  LIST_PAGE_SIZE_QUERY_KEY,
  parseListPageParams,
} from "@/lib/list-pagination";
import {
  ADMIN_CLIENTS_VIEW_QUERY_KEY,
  parseAdminClientsViewMode,
} from "@/lib/admin-clients-view-preference";
import {
  CLIENT_ADD_PACKAGE_QUERY_KEY,
  CLIENT_PROFILE_TAB_QUERY_KEY,
} from "@/components/admin/admin-client-sheet-tabs";

/** Admin / manager clients directory — one page of compact rows. */
export const ADMIN_CLIENTS_LIST_PAGE_SIZE = 10;

/** Sphere view needs a denser page so the globe is filled. */
export const ADMIN_CLIENTS_SPHERE_PAGE_SIZE = 48;

export function parseAdminClientsListPageParams(
  search: Record<string, string | undefined>,
) {
  const view = parseAdminClientsViewMode(search[ADMIN_CLIENTS_VIEW_QUERY_KEY]);
  const defaultPageSize =
    view === "sphere" ? ADMIN_CLIENTS_SPHERE_PAGE_SIZE : ADMIN_CLIENTS_LIST_PAGE_SIZE;
  return parseListPageParams(search, { defaultPageSize });
}

/** URL filter keys synced with `AdminListClientsQueryDto` (excluding `meta`). */
export const ADMIN_CLIENTS_FILTER_KEYS = [
  "search",
  "tag",
  "status",
  "package",
  "classLevel",
  "paymentStatus",
  "source",
  "preferredCoachId",
  "attendance",
  "birthdayMonth",
  "order",
  "quick",
] as const;

const ADMIN_CLIENTS_API_QUERY_KEYS = [...ADMIN_CLIENTS_FILTER_KEYS, "q"] as const;

/** UI-only query keys kept in the URL but not sent to `GET /clients`. */
export const ADMIN_CLIENTS_UI_QUERY_KEYS = [
  "viewClient",
  ADMIN_CLIENTS_VIEW_QUERY_KEY,
  CLIENT_PROFILE_TAB_QUERY_KEY,
  CLIENT_ADD_PACKAGE_QUERY_KEY,
  LIST_PAGE_QUERY_KEY,
  LIST_PAGE_SIZE_QUERY_KEY,
] as const;

/** Keys preserved when filters rewrite the URL. `page` is omitted so filters always open page 1. */
const ADMIN_CLIENTS_FILTER_PRESERVED_UI_KEYS = [
  "viewClient",
  ADMIN_CLIENTS_VIEW_QUERY_KEY,
  CLIENT_PROFILE_TAB_QUERY_KEY,
  CLIENT_ADD_PACKAGE_QUERY_KEY,
  LIST_PAGE_SIZE_QUERY_KEY,
] as const;

export { LIST_PAGE_QUERY_KEY, LIST_PAGE_SIZE_QUERY_KEY };

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
  const listPage = parseAdminClientsListPageParams(search);
  params.set("take", String(listPage.take));
  params.set("offset", String(listPage.offset));
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

export function buildAdminClientsFilterQuery(
  values: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const key of ADMIN_CLIENTS_FILTER_KEYS) {
    const value = values[key]?.trim() ?? "";
    if (value !== "" && !(key === "order" && value === "newest")) {
      params.set(key, value);
    }
  }
  return params.toString();
}

export function mergeAdminClientsUrlQuery(
  filterQuery: string,
  currentQuery: string,
): string {
  const params = new URLSearchParams(filterQuery);
  const current = new URLSearchParams(currentQuery);
  for (const key of ADMIN_CLIENTS_FILTER_PRESERVED_UI_KEYS) {
    const value = current.get(key);
    if (value) {
      params.set(key, value);
    }
  }
  return params.toString();
}

/** Reads the live browser query string (no leading `?`). */
export function readBrowserSearchQuery(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return window.location.search.startsWith("?")
    ? window.location.search.slice(1)
    : window.location.search;
}

/**
 * Mutates the current browser search params and replaces only when the result differs.
 * Always starts from `window.location` so concurrent replaces cannot drop sibling keys.
 */
export function replaceAdminClientsSearchParams(
  pathname: string,
  router: { replace: (href: string, options?: { scroll?: boolean }) => void },
  mutator: (params: URLSearchParams) => void,
): void {
  const params = new URLSearchParams(readBrowserSearchQuery());
  const before = params.toString();
  mutator(params);
  const after = params.toString();
  if (areUrlSearchQueriesEqual(before, after)) {
    return;
  }
  router.replace(after ? `${pathname}?${after}` : pathname, { scroll: false });
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
