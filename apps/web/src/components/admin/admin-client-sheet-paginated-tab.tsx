"use client";

import { useEffect, useState } from "react";
import { ClientHistoryList } from "@/components/admin/admin-client-drawer-sections";
import type { ClientSheetPaginatedResponse } from "@/components/admin/admin-clients-types";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { apiFetch } from "@/lib/api";
import { DEFAULT_LIST_PAGE_SIZE } from "@/lib/list-pagination";

type ClientSheetPaginatedTabProps<T> = {
  clientId: string;
  active: boolean;
  endpoint: string;
  title: string;
  empty: string;
  refreshKey?: number;
  mapItem: (item: T) => { id: string; main: string; meta: string; extra: string | null };
};

type PaginatedFetchResult<T> = {
  key: string;
  items: T[];
  total: number;
};

export function ClientSheetPaginatedTab<T>({
  clientId,
  active,
  endpoint,
  title,
  empty,
  refreshKey = 0,
  mapItem,
}: ClientSheetPaginatedTabProps<T>) {
  const [page, setPage] = useState(1);
  const [prevClientId, setPrevClientId] = useState(clientId);
  const pageSize = DEFAULT_LIST_PAGE_SIZE;
  const [result, setResult] = useState<PaginatedFetchResult<T> | null>(null);

  if (clientId !== prevClientId) {
    setPrevClientId(clientId);
    setPage(1);
  }

  const fetchKey = `${clientId}:${page}:${pageSize}:${refreshKey}`;
  const loading = active && (result === null || result.key !== fetchKey);
  const items = result?.key === fetchKey ? result.items : [];
  const total = result?.key === fetchKey ? result.total : 0;

  useEffect(() => {
    if (!active) {
      return undefined;
    }
    let cancelled = false;
    const offset = (page - 1) * pageSize;
    void apiFetch<ClientSheetPaginatedResponse<T>>(
      `${endpoint}?take=${pageSize}&offset=${offset}`,
    )
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setResult({ key: fetchKey, items: payload.items, total: payload.total });
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ key: fetchKey, items: [], total: 0 });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [active, endpoint, fetchKey, page, pageSize]);

  const offset = (page - 1) * pageSize;

  return (
    <div className="space-y-4">
      <ClientHistoryList
        title={title}
        empty={loading ? "" : empty}
        items={loading ? [] : items.map(mapItem)}
      />
      {loading ? <p className="text-sm text-sage-500">…</p> : null}
      <OmmListPagination
        total={total}
        page={page}
        pageSize={pageSize}
        offset={offset}
        disabled={loading}
        onPageChange={setPage}
      />
    </div>
  );
}
