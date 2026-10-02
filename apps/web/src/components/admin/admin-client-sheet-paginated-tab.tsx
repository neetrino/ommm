"use client";

import { useEffect, useState, type ReactNode } from "react";
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
  mapItem?: (item: T) => { id: string; main: string; meta: string; extra: string | null };
  /** Replaces the plain history rows. Used for the gift-card artwork board. */
  renderItems?: (items: T[]) => ReactNode;
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
  renderItems,
}: ClientSheetPaginatedTabProps<T>) {
  const pageState = useClientSheetPage<T>({ clientId, active, endpoint, refreshKey });

  return (
    <div className="space-y-4">
      <ClientSheetPageBody
        loading={pageState.loading}
        title={title}
        empty={empty}
        items={pageState.items}
        mapItem={mapItem}
        renderItems={renderItems}
      />
      <OmmListPagination
        total={pageState.total}
        page={pageState.page}
        pageSize={pageState.pageSize}
        offset={pageState.offset}
        disabled={pageState.loading}
        onPageChange={pageState.setPage}
        scrollOnPageChange={false}
      />
    </div>
  );
}

function useClientSheetPage<T>({
  clientId,
  active,
  endpoint,
  refreshKey,
}: {
  clientId: string;
  active: boolean;
  endpoint: string;
  refreshKey: number;
}) {
  const [page, setPage] = useState(1);
  const [prevClientId, setPrevClientId] = useState(clientId);
  const pageSize = DEFAULT_LIST_PAGE_SIZE;
  const [result, setResult] = useState<PaginatedFetchResult<T> | null>(null);

  if (clientId !== prevClientId) {
    setPrevClientId(clientId);
    setPage(1);
  }

  const fetchKey = `${clientId}:${page}:${pageSize}:${refreshKey}`;
  useClientSheetFetch({ active, endpoint, page, pageSize, fetchKey, setResult });

  const ready = result?.key === fetchKey;
  const offset = (page - 1) * pageSize;
  return {
    page,
    setPage,
    pageSize,
    loading: active && !ready,
    items: ready ? result.items : [],
    total: ready ? result.total : 0,
    offset,
  };
}

function useClientSheetFetch<T>({
  active,
  endpoint,
  page,
  pageSize,
  fetchKey,
  setResult,
}: {
  active: boolean;
  endpoint: string;
  page: number;
  pageSize: number;
  fetchKey: string;
  setResult: (value: PaginatedFetchResult<T>) => void;
}): void {
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
        if (!cancelled) {
          setResult({ key: fetchKey, items: payload.items, total: payload.total });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ key: fetchKey, items: [], total: 0 });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [active, endpoint, fetchKey, page, pageSize, setResult]);
}

function ClientSheetPageBody<T>({
  loading,
  title,
  empty,
  items,
  mapItem,
  renderItems,
}: {
  loading: boolean;
  title: string;
  empty: string;
  items: T[];
  mapItem?: (item: T) => { id: string; main: string; meta: string; extra: string | null };
  renderItems?: (items: T[]) => ReactNode;
}) {
  if (renderItems !== undefined) {
    return loading ? <p className="text-sm text-sage-500">…</p> : renderItems(items);
  }

  return (
    <>
      <ClientHistoryList
        title={title}
        empty={loading ? "" : empty}
        items={loading || mapItem === undefined ? [] : items.map(mapItem)}
      />
      {loading ? <p className="text-sm text-sage-500">…</p> : null}
    </>
  );
}
