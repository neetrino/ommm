export const DEFAULT_LIST_PAGE_SIZE = 25;

export const MAX_LIST_PAGE_SIZE = 100;

export const LIST_PAGE_QUERY_KEY = "page";

export const LIST_PAGE_SIZE_QUERY_KEY = "pageSize";

export type ListPageQueryKeys = {
  pageKey: string;
  pageSizeKey: string;
};

export const DEFAULT_LIST_PAGE_QUERY_KEYS: ListPageQueryKeys = {
  pageKey: LIST_PAGE_QUERY_KEY,
  pageSizeKey: LIST_PAGE_SIZE_QUERY_KEY,
};

export type ListPageParams = {
  page: number;
  pageSize: number;
  offset: number;
  take: number;
};

export type ListPageRange = {
  from: number;
  to: number;
  total: number;
};

type ParseListPageOptions = Partial<ListPageQueryKeys> & {
  defaultPageSize?: number;
};

function readPositiveInt(value: string | undefined, fallback: number, max?: number): number {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  if (max !== undefined) {
    return Math.min(parsed, max);
  }
  return parsed;
}

/** Parses 1-based page + pageSize from URL search params. */
export function parseListPageParams(
  search: Record<string, string | undefined>,
  options?: ParseListPageOptions,
): ListPageParams {
  const pageKey = options?.pageKey ?? LIST_PAGE_QUERY_KEY;
  const pageSizeKey = options?.pageSizeKey ?? LIST_PAGE_SIZE_QUERY_KEY;
  const defaultPageSize = options?.defaultPageSize ?? DEFAULT_LIST_PAGE_SIZE;
  const pageSize = readPositiveInt(search[pageSizeKey], defaultPageSize, MAX_LIST_PAGE_SIZE);
  const page = readPositiveInt(search[pageKey], 1);
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset, take: pageSize };
}

export function totalListPages(total: number, pageSize: number): number {
  if (total <= 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(total / pageSize));
}

export function clampListPage(page: number, total: number, pageSize: number): number {
  return Math.min(Math.max(page, 1), totalListPages(total, pageSize));
}

/** Inclusive 1-based row range for the current page. */
export function listPageRange(offset: number, take: number, total: number): ListPageRange {
  if (total <= 0) {
    return { from: 0, to: 0, total: 0 };
  }
  if (offset >= total) {
    const pageSize = Math.max(1, take);
    const lastOffset = (totalListPages(total, pageSize) - 1) * pageSize;
    return {
      from: lastOffset + 1,
      to: total,
      total,
    };
  }
  const from = offset + 1;
  const to = Math.min(offset + take, total);
  return { from, to, total };
}

export function syncListPageQuery(
  params: URLSearchParams,
  page: number,
  pageSize?: number,
  keys: ListPageQueryKeys = DEFAULT_LIST_PAGE_QUERY_KEYS,
): void {
  if (page <= 1) {
    params.delete(keys.pageKey);
  } else {
    params.set(keys.pageKey, String(page));
  }
  if (pageSize === undefined) {
    return;
  }
  if (pageSize === DEFAULT_LIST_PAGE_SIZE) {
    params.delete(keys.pageSizeKey);
  } else {
    params.set(keys.pageSizeKey, String(pageSize));
  }
}

export function resetListPageQuery(
  params: URLSearchParams,
  keys: ListPageQueryKeys = DEFAULT_LIST_PAGE_QUERY_KEYS,
): void {
  params.delete(keys.pageKey);
  params.delete(keys.pageSizeKey);
}

/** Page 1 of the current page size — used when filters change before the URL page resets. */
export function firstListPageParams(pageSize: number): ListPageParams {
  return { page: 1, pageSize, offset: 0, take: pageSize };
}

export function listPageParamsForFetch(
  listPage: ListPageParams,
  resetToFirstPage: boolean,
): ListPageParams {
  return resetToFirstPage ? firstListPageParams(listPage.pageSize) : listPage;
}

export function isOutOfRangeEmptyPage(input: {
  rowCount: number;
  total: number;
  offset: number;
}): boolean {
  return input.total > 0 && input.rowCount === 0 && input.offset >= input.total;
}
