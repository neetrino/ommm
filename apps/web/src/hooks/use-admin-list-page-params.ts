"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useIsMarketingPhoneViewport } from "@/hooks/use-is-marketing-phone-viewport";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  ADMIN_MOBILE_LIST_PAGE_SIZE,
  DEFAULT_LIST_PAGE_SIZE,
  LIST_PAGE_QUERY_KEY,
  LIST_PAGE_SIZE_QUERY_KEY,
  type ListPageParams,
  type ListPageQueryKeys,
  parseListPageParams,
  syncListPageQuery,
} from "@/lib/list-pagination";

type UseAdminListPageParamsOptions = Partial<ListPageQueryKeys> & {
  defaultPageSize?: number;
};

export function useAdminListPageParams(
  options?: UseAdminListPageParamsOptions,
): {
  listPage: ListPageParams;
  setListPage: (page: number, pageSize?: number) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMarketingPhoneViewport();
  const pageKey = options?.pageKey ?? LIST_PAGE_QUERY_KEY;
  const pageSizeKey = options?.pageSizeKey ?? LIST_PAGE_SIZE_QUERY_KEY;
  const queryKeys = useMemo(
    (): ListPageQueryKeys => ({ pageKey, pageSizeKey }),
    [pageKey, pageSizeKey],
  );
  const desktopDefaultPageSize = options?.defaultPageSize ?? DEFAULT_LIST_PAGE_SIZE;
  const resolvedDefaultPageSize = isMobile
    ? ADMIN_MOBILE_LIST_PAGE_SIZE
    : desktopDefaultPageSize;

  const listPage = useMemo(
    () =>
      parseListPageParams(Object.fromEntries(searchParams.entries()), {
        ...queryKeys,
        defaultPageSize: resolvedDefaultPageSize,
      }),
    [queryKeys, resolvedDefaultPageSize, searchParams],
  );

  useEffect(() => {
    if (!isMobile || searchParams.has(pageSizeKey)) {
      return;
    }
    if (desktopDefaultPageSize === ADMIN_MOBILE_LIST_PAGE_SIZE) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    syncListPageQuery(params, 1, ADMIN_MOBILE_LIST_PAGE_SIZE, queryKeys);
    const query = params.toString();
    router.replace(query.length > 0 ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [
    desktopDefaultPageSize,
    isMobile,
    pageSizeKey,
    pathname,
    queryKeys,
    router,
    searchParams,
  ]);

  const setListPage = useCallback(
    (page: number, pageSize?: number) => {
      const params = new URLSearchParams(searchParams.toString());
      syncListPageQuery(params, page, pageSize ?? listPage.pageSize, queryKeys);
      const query = params.toString();
      router.replace(query.length > 0 ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [listPage.pageSize, pathname, queryKeys, router, searchParams],
  );

  return { listPage, setListPage };
}
