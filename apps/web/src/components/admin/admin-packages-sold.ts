import { parseListPageParams } from "@/lib/list-pagination";

export const ADMIN_PACKAGES_PATH = "/admin/packages";

export const PACKAGES_SOLD_PATH = `${ADMIN_PACKAGES_PATH}/sold`;

export const PACKAGES_SOLD_LIST_PAGE_SIZE = 10;

export const PACKAGES_SOLD_SEARCH_QUERY_KEY = "q";

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
  take: number;
  offset: number;
};

export function parseSoldPackagesSearchQuery(
  search: Record<string, string | undefined>,
): string {
  return search[PACKAGES_SOLD_SEARCH_QUERY_KEY]?.trim() ?? "";
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
): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  const trimmed = q.trim();
  if (trimmed.length > 0) {
    params.set(PACKAGES_SOLD_SEARCH_QUERY_KEY, trimmed);
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
