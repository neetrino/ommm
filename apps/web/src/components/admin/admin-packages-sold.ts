import { parseListPageParams } from "@/lib/list-pagination";

export const ADMIN_PACKAGES_PATH = "/admin/packages";

export const PACKAGES_SOLD_PATH = `${ADMIN_PACKAGES_PATH}/sold`;

export const PACKAGES_SOLD_LIST_PAGE_SIZE = 12;

export const PACKAGES_SOLD_SEARCH_QUERY_KEY = "q";

export const PACKAGES_SOLD_PLAN_QUERY_KEY = "planId";

export const PACKAGES_SOLD_PLAN_ALL = "all";

export const PACKAGES_SOLD_SEARCH_DEBOUNCE_MS = 300;

export type SoldPackageListItem = {
  id: string;
  createdAt: string;
  amountCents: number;
  currency: string;
  packageName: string;
  user: {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string;
  };
};

export type SoldPackageListPayload = {
  items: SoldPackageListItem[];
  total: number;
  totalAmountCents: number;
  take: number;
  offset: number;
};

export function parseSoldPackagesSearchQuery(
  search: Record<string, string | undefined>,
): string {
  return search[PACKAGES_SOLD_SEARCH_QUERY_KEY]?.trim() ?? "";
}

export function parseSoldPackagesPlanId(
  search: Record<string, string | undefined>,
): string {
  const value = search[PACKAGES_SOLD_PLAN_QUERY_KEY]?.trim() ?? "";
  if (value.length === 0 || value === PACKAGES_SOLD_PLAN_ALL) {
    return PACKAGES_SOLD_PLAN_ALL;
  }
  return value;
}

export function parseSoldPackagesPageParams(
  search: Record<string, string | undefined>,
) {
  return parseListPageParams(search, {
    defaultPageSize: PACKAGES_SOLD_LIST_PAGE_SIZE,
  });
}

export function buildSoldPackagesAdminEndpoint(
  take: number,
  offset: number,
  q: string,
  planId: string = PACKAGES_SOLD_PLAN_ALL,
): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  const trimmedQuery = q.trim();
  if (trimmedQuery.length > 0) {
    params.set(PACKAGES_SOLD_SEARCH_QUERY_KEY, trimmedQuery);
  }
  const trimmedPlanId = (planId ?? PACKAGES_SOLD_PLAN_ALL).trim();
  if (trimmedPlanId.length > 0 && trimmedPlanId !== PACKAGES_SOLD_PLAN_ALL) {
    params.set(PACKAGES_SOLD_PLAN_QUERY_KEY, trimmedPlanId);
  }
  return `/packages/admin/sold?${params.toString()}`;
}

export function normalizePageSearchParams(
  search: Record<string, string | string[] | undefined>,
): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(search).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
}
