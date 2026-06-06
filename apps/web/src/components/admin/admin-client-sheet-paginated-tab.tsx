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
  const [pageSize, setPageSize] = useState(DEFAULT_LIST_PAGE_SIZE);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [clientId]);

  useEffect(() => {
    if (!active) {
      return;
    }
    let cancelled = false;
    const offset = (page - 1) * pageSize;
    setLoading(true);
    void apiFetch<ClientSheetPaginatedResponse<T>>(
      `${endpoint}?take=${pageSize}&offset=${offset}`,
    )
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setItems(payload.items);
        setTotal(payload.total);
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [active, clientId, endpoint, page, pageSize, refreshKey]);

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
        onPageSizeChange={(nextPageSize) => {
          setPage(1);
          setPageSize(nextPageSize);
        }}
      />
    </div>
  );
}
