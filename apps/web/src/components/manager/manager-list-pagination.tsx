"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { syncListPageQuery } from "@/lib/list-pagination";

type ManagerListPaginationProps = {
  total: number;
  page: number;
  pageSize: number;
  offset: number;
};

export function ManagerListPagination({
  total,
  page,
  pageSize,
  offset,
}: ManagerListPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigate = useCallback(
    (nextPage: number, nextPageSize?: number) => {
      const params = new URLSearchParams(searchParams.toString());
      syncListPageQuery(params, nextPage, nextPageSize);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <OmmListPagination
      total={total}
      page={page}
      pageSize={pageSize}
      offset={offset}
      onPageChange={(nextPage) => navigate(nextPage)}
      onPageSizeChange={(nextPageSize) => navigate(1, nextPageSize)}
    />
  );
}
