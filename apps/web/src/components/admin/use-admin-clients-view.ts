"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { replaceAdminClientsSearchParams } from "@/components/admin/admin-clients-query";
import {
  ADMIN_CLIENTS_VIEW_QUERY_KEY,
  parseAdminClientsViewMode,
  type AdminClientsViewMode,
} from "@/lib/admin-clients-view-preference";
import { resetListPageQuery } from "@/lib/list-pagination";

export function useAdminClientsView(): {
  viewMode: AdminClientsViewMode;
  setViewMode: (mode: AdminClientsViewMode) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const viewMode = useMemo(
    () => parseAdminClientsViewMode(searchParams.get(ADMIN_CLIENTS_VIEW_QUERY_KEY)),
    [searchParams],
  );

  const setViewMode = useCallback(
    (mode: AdminClientsViewMode) => {
      replaceAdminClientsSearchParams(pathname, router, (params) => {
        params.set(ADMIN_CLIENTS_VIEW_QUERY_KEY, mode);
        resetListPageQuery(params);
      });
    },
    [pathname, router],
  );

  return { viewMode, setViewMode };
}
