"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminManagerCompactRow } from "@/components/admin/admin-manager-compact-row";
import { AdminManagerDetailsDrawer } from "@/components/admin/admin-manager-details-drawer";
import {
  ADMIN_MANAGERS_LIST_ACTIONS_HEADER_CELL,
  ADMIN_MANAGERS_LIST_EMPHASIZED_HEADER,
  ADMIN_MANAGERS_LIST_HEADER_CLASS,
  ADMIN_MANAGERS_LIST_TABLE_CLASS,
} from "@/components/admin/admin-managers-list-layout";
import type {
  AdminManagerDirectoryRow,
  AdminManagersListPayload,
} from "@/components/admin/admin-managers-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { parseListPageParams, syncListPageQuery } from "@/lib/list-pagination";

const MANAGER_PROFILE_QUERY_KEY = "managerId";

type AdminManagersDirectoryProps = {
  initial: AdminManagersListPayload;
};

export function AdminManagersDirectory({ initial }: AdminManagersDirectoryProps) {
  const t = useTranslations("adminPages.managers");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlManagerId = searchParams.get(MANAGER_PROFILE_QUERY_KEY);
  const [visibleManagerId, setVisibleManagerId] = useState<string | null>(urlManagerId);
  const [prevUrlManagerId, setPrevUrlManagerId] = useState(urlManagerId);
  const [rows, setRows] = useState(initial.items);
  const [prevInitial, setPrevInitial] = useState(initial);
  const [toast, setToast] = useState<string | null>(null);

  if (urlManagerId !== prevUrlManagerId) {
    setPrevUrlManagerId(urlManagerId);
    setVisibleManagerId(urlManagerId);
  }
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setRows(initial.items);
  }

  const listPage = useMemo(
    () => parseListPageParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const selected = useMemo(() => {
    if (visibleManagerId === null) {
      return null;
    }
    return rows.find((row) => row.id === visibleManagerId) ?? null;
  }, [rows, visibleManagerId]);

  const updateQuery = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setListPage = useCallback(
    (page: number) => {
      updateQuery((params) => {
        syncListPageQuery(params, page);
      });
    },
    [updateQuery],
  );

  const openDrawer = useCallback(
    (manager: AdminManagerDirectoryRow) => {
      setVisibleManagerId(manager.id);
      updateQuery((params) => {
        params.set(MANAGER_PROFILE_QUERY_KEY, manager.id);
      });
    },
    [updateQuery],
  );

  const closeDrawer = useCallback(() => {
    setVisibleManagerId(null);
    updateQuery((params) => {
      params.delete(MANAGER_PROFILE_QUERY_KEY);
    });
  }, [updateQuery]);

  return (
    <>
      <div className={ADMIN_MANAGERS_LIST_TABLE_CLASS}>
        <div className={ADMIN_MANAGERS_LIST_HEADER_CLASS}>
          <span>{t("colManagers")}</span>
          <span className={ADMIN_MANAGERS_LIST_EMPHASIZED_HEADER}>{t("colEmail")}</span>
          <span className={ADMIN_MANAGERS_LIST_EMPHASIZED_HEADER}>{t("colAccess")}</span>
          <span className={ADMIN_MANAGERS_LIST_EMPHASIZED_HEADER}>{t("colJoined")}</span>
          <span className={ADMIN_MANAGERS_LIST_ACTIONS_HEADER_CELL}>{t("colActions")}</span>
        </div>
        {rows.map((manager) => (
          <AdminManagerCompactRow
            key={manager.id}
            manager={manager}
            onSelect={openDrawer}
            onChanged={() => router.refresh()}
          />
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-white/60 bg-white/70 p-6 text-sm text-sage-600">
          {t("emptyState")}
        </div>
      ) : null}
      {initial.total > 0 ? (
        <OmmListPagination
          total={initial.total}
          page={listPage.page}
          pageSize={listPage.pageSize}
          offset={initial.offset}
          onPageChange={setListPage}
        />
      ) : null}
      <AdminManagerDetailsDrawer
        manager={selected}
        onClose={closeDrawer}
        onUpdated={(id, patch) => {
          setRows((current) =>
            current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
          );
        }}
        onSaveSuccess={setToast}
      />
      {toast ? (
        <AdminCenterToast message={toast} tone="ok" onDismiss={() => setToast(null)} />
      ) : null}
    </>
  );
}
