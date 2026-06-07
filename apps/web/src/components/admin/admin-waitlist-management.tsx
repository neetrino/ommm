"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { usePropSyncedState } from "@/hooks/use-prop-synced-state";
import { AdminWaitlistCompactRow } from "@/components/admin/admin-waitlist-compact-row";
import {
  ADMIN_WAITLIST_LIST_ACTIONS_HEADER_CELL,
  ADMIN_WAITLIST_LIST_EMPHASIZED_HEADER,
  ADMIN_WAITLIST_LIST_HEADER_CLASS,
  ADMIN_WAITLIST_LIST_TABLE_CLASS,
} from "@/components/admin/admin-waitlist-list-layout";
import {
  buildAdminWaitlistActiveEndpoint,
  parseAdminWaitlistSortOrder,
  type AdminWaitlistActivePayload,
  type AdminWaitlistRow,
  type AdminWaitlistSortOrder,
} from "@/components/admin/admin-waitlist-query";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { adminChrome } from "@/components/admin/admin-chrome";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { AdminUserDetailsDrawer } from "@/components/admin/admin-user-details-drawer";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { useCloseOnEscape } from "@/hooks/use-close-on-escape";
import { usePathname, useRouter } from "@/i18n/navigation";
import { parseListPageParams, resetListPageQuery, syncListPageQuery } from "@/lib/list-pagination";
import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import { OmmFilterDropdown } from "@/components/ui/omm-select-dropdown";

const WAITLIST_SEARCH_KEY = "search";
const WAITLIST_CLASS_TYPE_KEY = "classTypeId";
const WAITLIST_ORDER_KEY = "order";

type ToastTone = "ok" | "err";

type AdminWaitlistManagementProps = {
  locale: string;
  initial: AdminWaitlistActivePayload;
  initialLoadError: string | null;
  staffBanner?: string;
};

function toUserLabel(name: string | null, lastName: string | null, email: string): string {
  const full = [name, lastName].filter((part) => part && part.trim().length > 0).join(" ");
  return full.length > 0 ? full : email;
}

export function AdminWaitlistManagement({
  locale,
  initial,
  initialLoadError,
  staffBanner,
}: AdminWaitlistManagementProps) {
  const t = useTranslations("adminPages.waitlists");
  const tSort = useTranslations("listSort");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [payload, setPayload] = usePropSyncedState(initial);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(initialLoadError);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<AdminWaitlistRow | null>(null);
  const [, startRefreshTransition] = useTransition();
  const refreshRequestId = useRef(0);
  const urlSearchDraft = searchParams.get(WAITLIST_SEARCH_KEY)?.trim() ?? "";
  const [searchDraft, setSearchDraft] = useState(urlSearchDraft);
  const [prevUrlSearchDraft, setPrevUrlSearchDraft] = useState(urlSearchDraft);
  if (urlSearchDraft !== prevUrlSearchDraft) {
    setPrevUrlSearchDraft(urlSearchDraft);
    setSearchDraft(urlSearchDraft);
  }
  const classTypeFilter = searchParams.get(WAITLIST_CLASS_TYPE_KEY)?.trim() ?? "";
  const orderFilter = parseAdminWaitlistSortOrder(
    searchParams.get(WAITLIST_ORDER_KEY) ?? undefined,
  );

  const listPage = useMemo(
    () => parseListPageParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const replaceSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutator(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setListPage = useCallback(
    (page: number, pageSize?: number) => {
      replaceSearchParams((params) => {
        syncListPageQuery(params, page, pageSize);
      });
    },
    [replaceSearchParams],
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const trimmed = searchDraft.trim();
      const current = searchParams.get(WAITLIST_SEARCH_KEY)?.trim() ?? "";
      if (trimmed === current) {
        return;
      }
      replaceSearchParams((params) => {
        resetListPageQuery(params);
        if (trimmed.length > 0) {
          params.set(WAITLIST_SEARCH_KEY, trimmed);
        } else {
          params.delete(WAITLIST_SEARCH_KEY);
        }
      });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [replaceSearchParams, searchDraft, searchParams]);

  const classTypeOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of payload.items) {
      map.set(row.session.classType.id, row.session.classType.name);
    }
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [payload.items]);

  const waitlistFilterFields = useMemo((): AdminIntegratedFilterField[] => {
    return [
      {
        key: WAITLIST_CLASS_TYPE_KEY,
        label: t("colClassType"),
        render: ({ value, onChange }) => (
          <OmmFilterDropdown
            allValue=""
            value={value}
            ariaLabel={t("colClassType")}
            allLabel={t("filterClassAll")}
            onChange={onChange}
            options={classTypeOptions}
          />
        ),
      },
      {
        key: WAITLIST_ORDER_KEY,
        label: tSort("sort"),
        emptyValue: "newest",
        options: [
          { value: "newest", label: tSort("newest") },
          { value: "oldest", label: tSort("oldest") },
          { value: "upcoming", label: tSort("upcoming") },
          { value: "date-asc", label: tSort("dateAsc") },
          { value: "date-desc", label: tSort("dateDesc") },
        ],
      },
    ];
  }, [classTypeOptions, t, tSort]);

  const waitlistFilterValues = useMemo(
    () => ({
      [WAITLIST_CLASS_TYPE_KEY]: classTypeFilter,
      [WAITLIST_ORDER_KEY]: orderFilter,
    }),
    [classTypeFilter, orderFilter],
  );

  function handleWaitlistFilterChange(key: string, value: string) {
    if (key === WAITLIST_CLASS_TYPE_KEY) {
      replaceSearchParams((params) => {
        resetListPageQuery(params);
        if (value.trim().length > 0) {
          params.set(WAITLIST_CLASS_TYPE_KEY, value);
        } else {
          params.delete(WAITLIST_CLASS_TYPE_KEY);
        }
      });
      return;
    }
    if (key === WAITLIST_ORDER_KEY) {
      replaceSearchParams((params) => {
        resetListPageQuery(params);
        const nextOrder = parseAdminWaitlistSortOrder(value) as AdminWaitlistSortOrder;
        if (nextOrder === "newest") {
          params.delete(WAITLIST_ORDER_KEY);
        } else {
          params.set(WAITLIST_ORDER_KEY, nextOrder);
        }
      });
    }
  }

  function resetWaitlistFilters() {
    setSearchDraft("");
    replaceSearchParams((params) => {
      resetListPageQuery(params);
      params.delete(WAITLIST_SEARCH_KEY);
      params.delete(WAITLIST_CLASS_TYPE_KEY);
      params.delete(WAITLIST_ORDER_KEY);
    });
  }

  const filteredRows = useMemo(() => {
    const q = searchDraft.trim().toLowerCase();
    return payload.items.filter((row) => {
      if (classTypeFilter && row.session.classType.id !== classTypeFilter) {
        return false;
      }
      if (q.length === 0) {
        return true;
      }
      const userLabel = toUserLabel(row.user.name, row.user.lastName, row.user.email).toLowerCase();
      const haystack = [
        userLabel,
        row.user.email.toLowerCase(),
        row.user.phone?.toLowerCase() ?? "",
        row.session.classType.name.toLowerCase(),
      ].join(" ");
      return haystack.includes(q);
    });
  }, [classTypeFilter, payload.items, searchDraft]);

  const loadRows = useCallback(async () => {
    const requestId = ++refreshRequestId.current;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiFetch<AdminWaitlistActivePayload>(
        buildAdminWaitlistActiveEndpoint(listPage.take, listPage.offset, orderFilter),
      );
      if (requestId !== refreshRequestId.current) {
        return;
      }
      setPayload(data);
    } catch (error) {
      if (requestId !== refreshRequestId.current) {
        return;
      }
      setLoadError(error instanceof ApiError ? error.message : t("loadFailed"));
    } finally {
      if (requestId === refreshRequestId.current) {
        setLoading(false);
      }
    }
  }, [listPage.offset, listPage.take, orderFilter, setPayload, t]);

  const refreshList = useCallback(() => {
    startRefreshTransition(() => {
      router.refresh();
    });
  }, [router, startRefreshTransition]);

  async function runAction(
    row: AdminWaitlistRow,
    actionKey: "promote" | "notify" | "remove",
    run: () => Promise<void>,
    successMessage: string,
  ) {
    const lockKey = `${row.id}:${actionKey}`;
    if (busyAction !== null) {
      return;
    }
    setBusyAction(lockKey);
    setToast(null);
    try {
      await run();
      setToast({ tone: "ok", message: successMessage });
      await loadRows();
      refreshList();
    } catch (error) {
      setToast({
        tone: "err",
        message: error instanceof ApiError ? error.message : t("actionFailed"),
      });
    } finally {
      setBusyAction(null);
    }
  }

  const rows = filteredRows;
  const hasRows = rows.length > 0;
  const hasLoadedRows = payload.items.length > 0;

  const closeRemoveConfirm = useCallback(() => {
    setPendingRemove(null);
  }, []);

  useCloseOnEscape(pendingRemove !== null, closeRemoveConfirm, {
    disabled: busyAction !== null,
  });

  const confirmRemoveLabel = useMemo(() => {
    if (pendingRemove === null) {
      return "";
    }
    return toUserLabel(
      pendingRemove.user.name,
      pendingRemove.user.lastName,
      pendingRemove.user.email,
    );
  }, [pendingRemove]);

  if (loadError && !hasLoadedRows) {
    return (
      <StaffListPageLayout
        title={t("title")}
        banner={staffBanner}
        status={
          <div className={adminChrome.panel}>
            <p className="text-sm text-red-800">{loadError}</p>
            <button
              type="button"
              className="ommm-cta-secondary mt-3 h-9 px-4"
              onClick={() => void loadRows()}
            >
              {t("retry")}
            </button>
          </div>
        }
      >
        <span className="sr-only">{t("loadFailed")}</span>
      </StaffListPageLayout>
    );
  }

  const waitlistBody = !hasRows ? (
    <div className={adminChrome.panel}>{t("empty")}</div>
  ) : (
    <div className={ADMIN_WAITLIST_LIST_TABLE_CLASS}>
      <div className={ADMIN_WAITLIST_LIST_HEADER_CLASS}>
        <span>{t("colUser")}</span>
        <span className={ADMIN_WAITLIST_LIST_EMPHASIZED_HEADER}>{t("colClassType")}</span>
        <span className={`${ADMIN_WAITLIST_LIST_EMPHASIZED_HEADER} md:text-center`}>
          {t("colWaitlistCount")}
        </span>
        <span className={`${ADMIN_WAITLIST_LIST_EMPHASIZED_HEADER} md:text-center`}>
          {t("colWaitlistDate")}
        </span>
        <span aria-hidden="true" />
        <span className={ADMIN_WAITLIST_LIST_ACTIONS_HEADER_CELL}>{t("colActions")}</span>
      </div>
      {rows.map((row) => {
        const rowBusy = busyAction?.startsWith(`${row.id}:`) ?? false;
        const userLabel = toUserLabel(row.user.name, row.user.lastName, row.user.email);
        return (
          <AdminWaitlistCompactRow
            key={row.id}
            locale={locale}
            row={row}
            rowBusy={rowBusy}
            userLabel={userLabel}
            onOpenUser={setSelectedUserId}
            onPromote={() =>
              void runAction(
                row,
                "promote",
                () =>
                  apiFetch(`/waitlist/entries/${row.id}/promote`, {
                    method: "POST",
                    body: JSON.stringify({ targetSessionId: row.session.id }),
                  }),
                t("successPromote"),
              )
            }
            onNotify={() =>
              void runAction(
                row,
                "notify",
                () =>
                  apiFetch(`/waitlist/entries/${row.id}/notify`, {
                    method: "POST",
                    body: JSON.stringify({}),
                  }),
                t("successNotify"),
              )
            }
            onRemove={() => setPendingRemove(row)}
          />
        );
      })}
      <OmmListPagination
        total={payload.total}
        page={listPage.page}
        pageSize={listPage.pageSize}
        offset={payload.offset}
        onPageChange={(page) => setListPage(page)}
        disabled={loading || busyAction !== null}
      />
    </div>
  );

  return (
    <>
      <StaffListPageLayout
        title={t("title")}
        banner={staffBanner}
        search={
          <ListPageSearchFilters
            search={searchDraft}
            onSearchChange={setSearchDraft}
            searchPlaceholder={t("filterSearch")}
            fields={waitlistFilterFields}
            filterValues={waitlistFilterValues}
            onFilterChange={handleWaitlistFilterChange}
            onClearAll={resetWaitlistFilters}
            resetLabel={t("resetFilters")}
          />
        }
        status={loadError ? <div className="app-alert-warn max-w-xl">{loadError}</div> : null}
      >
        {waitlistBody}
      </StaffListPageLayout>

      {toast ? (
        <div
          role="status"
          className={`fixed bottom-4 right-4 z-[95] max-w-sm rounded-xl border px-4 py-3 text-sm shadow-[0_12px_32px_-20px_rgba(45,40,35,0.4)] ${
            toast.tone === "ok"
              ? "border-mint-200/80 bg-mint-50/95 text-sage-900"
              : "border-red-200/80 bg-red-50/95 text-red-900"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      {pendingRemove ? (
        <div className="ommm-modal-overlay z-[95] items-center p-4" role="presentation">
          <button
            type="button"
            className="ommm-modal-backdrop"
            aria-label={t("removeConfirm.cancel")}
            onClick={() => setPendingRemove(null)}
            disabled={busyAction !== null}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/60 bg-white p-5 shadow-[0_20px_50px_-25px_rgba(45,40,35,0.35)]">
            <h3 className="text-base font-semibold text-sage-900">{t("removeConfirm.title")}</h3>
            <p className="mt-2 text-sm text-sage-700">
              {t("removeConfirm.description", { user: confirmRemoveLabel })}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="ommm-cta-secondary h-9 px-4"
                onClick={() => setPendingRemove(null)}
                disabled={busyAction !== null}
              >
                {t("removeConfirm.cancel")}
              </button>
              <button
                type="button"
                className="ommm-cta-primary h-9 px-4"
                onClick={() => {
                  void runAction(
                    pendingRemove,
                    "remove",
                    () => apiFetch(`/waitlist/entries/${pendingRemove.id}`, { method: "DELETE" }),
                    t("successRemove"),
                  );
                  setPendingRemove(null);
                }}
                disabled={busyAction !== null}
              >
                {t("removeConfirm.confirm")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AdminUserDetailsDrawer
        key={selectedUserId ?? "closed"}
        locale={locale}
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </>
  );
}
