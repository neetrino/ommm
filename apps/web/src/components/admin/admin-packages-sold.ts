import { parseListPageParams } from "@/lib/list-pagination";

export const ADMIN_PACKAGES_PATH = "/admin/packages";

export const PACKAGES_SOLD_PATH = `${ADMIN_PACKAGES_PATH}/sold`;

export const PACKAGES_SOLD_LIST_PAGE_SIZE = 12;

export const PACKAGES_SOLD_SEARCH_QUERY_KEY = "q";

export const PACKAGES_SOLD_PLAN_QUERY_KEY = "planId";

export const PACKAGES_SOLD_PLAN_ALL = "all";

export const PACKAGES_SOLD_CATEGORY_QUERY_KEY = "categorySlug";

export const PACKAGES_SOLD_CATEGORY_ALL = "all";

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
  return parseSoldPackagesFilterValue(
    search[PACKAGES_SOLD_PLAN_QUERY_KEY],
    PACKAGES_SOLD_PLAN_ALL,
  );
}

export function parseSoldPackagesCategorySlugs(value: string): string[] {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed === PACKAGES_SOLD_CATEGORY_ALL) {
    return [];
  }
  return [
    ...new Set(
      trimmed
        .split(",")
        .map((slug) => slug.trim())
        .filter((slug) => slug.length > 0 && slug !== PACKAGES_SOLD_CATEGORY_ALL),
    ),
  ];
}

export function serializeSoldPackagesCategorySlugs(
  values: readonly string[],
): string {
  const unique = [
    ...new Set(
      values
        .map((slug) => slug.trim())
        .filter((slug) => slug.length > 0 && slug !== PACKAGES_SOLD_CATEGORY_ALL),
    ),
  ];
  return unique.length === 0 ? PACKAGES_SOLD_CATEGORY_ALL : unique.join(",");
}

export function parseSoldPackagesCategorySlug(
  search: Record<string, string | undefined>,
): string {
  return serializeSoldPackagesCategorySlugs(
    parseSoldPackagesCategorySlugs(
      search[PACKAGES_SOLD_CATEGORY_QUERY_KEY] ?? "",
    ),
  );
}

function parseSoldPackagesFilterValue(
  raw: string | undefined,
  emptyValue: string,
): string {
  const value = raw?.trim() ?? "";
  if (value.length === 0 || value === emptyValue) {
    return emptyValue;
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
  categorySlug: string = PACKAGES_SOLD_CATEGORY_ALL,
): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  const trimmedQuery = q.trim();
  if (trimmedQuery.length > 0) {
    params.set(PACKAGES_SOLD_SEARCH_QUERY_KEY, trimmedQuery);
  }
  setSoldPackagesFilterParam(
    params,
    PACKAGES_SOLD_PLAN_QUERY_KEY,
    planId,
    PACKAGES_SOLD_PLAN_ALL,
  );
  setSoldPackagesFilterParam(
    params,
    PACKAGES_SOLD_CATEGORY_QUERY_KEY,
    categorySlug,
    PACKAGES_SOLD_CATEGORY_ALL,
  );
  return `/packages/admin/sold?${params.toString()}`;
}

function setSoldPackagesFilterParam(
  params: URLSearchParams,
  key: string,
  value: string | undefined,
  emptyValue: string,
): void {
  const trimmed = (value ?? emptyValue).trim();
  if (trimmed.length > 0 && trimmed !== emptyValue) {
    params.set(key, trimmed);
  }
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
