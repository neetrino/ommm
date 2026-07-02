"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { usePropSyncedState } from "@/hooks/use-prop-synced-state";
import { useRealtimeRefetch } from "@/hooks/use-realtime-refetch";
import { REALTIME_REFETCH_KEYS } from "@/lib/realtime/realtime-refetch-keys";
import { AdminWaitlistListBody } from "@/components/admin/admin-waitlist-list-body";
import { useAdminWaitlistFilterFields } from "@/components/admin/admin-waitlist-filter-fields";
import { useAdminWaitlistFilters } from "@/components/admin/use-admin-waitlist-filters";
import type { AdminWaitlistToastTone } from "@/components/admin/admin-waitlist-management.constants";
import { AdminWaitlistRemoveConfirmModal } from "@/components/admin/admin-waitlist-remove-confirm-modal";
import { formatAdminWaitlistUserLabel } from "@/components/admin/admin-waitlist-user-label";
import {
  buildAdminWaitlistActiveEndpoint,
  type AdminWaitlistActivePayload,
  type AdminWaitlistRow,
} from "@/components/admin/admin-waitlist-query";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { adminChrome } from "@/components/admin/admin-chrome";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { AdminUserDetailsDrawer } from "@/components/admin/admin-user-details-drawer";
import { useCloseOnEscape } from "@/hooks/use-close-on-escape";
import { useRouter } from "@/i18n/navigation";
import { parseListPageParams, syncListPageQuery } from "@/lib/list-pagination";

type AdminWaitlistManagementProps = {
  locale: string;
  initial: AdminWaitlistActivePayload;
  initialLoadError: string | null;
  staffBanner?: string;
};

export function AdminWaitlistManagement({
  locale,
  initial,
  initialLoadError,
  staffBanner,
}: AdminWaitlistManagementProps) {
  const t = useTranslations("adminPages.waitlists");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payload, setPayload] = usePropSyncedState(initial);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(initialLoadError);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [toast, setToast] = useState<{ tone: AdminWaitlistToastTone; message: string } | null>(
    null,
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<AdminWaitlistRow | null>(null);
  const [, startRefreshTransition] = useTransition();
  const refreshRequestId = useRef(0);

  const {
    searchDraft,
    setSearchDraft,
    classTypeFilter,
    orderFilter,
    filterValues: waitlistFilterValues,
    handleFilterChange: handleWaitlistFilterChange,
    resetFilters: resetWaitlistFilters,
    replaceSearchParams,
  } = useAdminWaitlistFilters();
  const waitlistFilterFields = useAdminWaitlistFilterFields({ items: payload.items });

  const listPage = useMemo(
    () => parseListPageParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const setListPage = useCallback(
    (page: number, pageSize?: number) => {
      replaceSearchParams((params) => {
        syncListPageQuery(params, page, pageSize);
      });
    },
    [replaceSearchParams],
  );

  const filteredRows = useMemo(() => {
    const q = searchDraft.trim().toLowerCase();
    return payload.items.filter((row) => {
      if (classTypeFilter && row.session.classType.id !== classTypeFilter) {
        return false;
      }
      if (q.length === 0) {
        return true;
      }
      const userLabel = formatAdminWaitlistUserLabel(
        row.user.name,
        row.user.lastName,
        row.user.email,
      ).toLowerCase();
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

  useRealtimeRefetch(REALTIME_REFETCH_KEYS.WAITLIST_ADMIN, () => {
    void loadRows();
  });
  useRealtimeRefetch(REALTIME_REFETCH_KEYS.BOOKINGS_ADMIN, () => {
    void loadRows();
  });

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
    return formatAdminWaitlistUserLabel(
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
    <AdminWaitlistListBody
      locale={locale}
      rows={rows}
      total={payload.total}
      listPage={listPage}
      offset={payload.offset}
      loading={loading}
      busyAction={busyAction}
      userLabelForRow={(row) =>
        formatAdminWaitlistUserLabel(row.user.name, row.user.lastName, row.user.email)
      }
      onOpenUser={setSelectedUserId}
      onPromote={(row) =>
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
      onNotify={(row) =>
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
      onRemove={setPendingRemove}
      onPageChange={setListPage}
      t={t}
    />
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
        <AdminWaitlistRemoveConfirmModal
          pendingRemove={pendingRemove}
          confirmRemoveLabel={confirmRemoveLabel}
          busyAction={busyAction}
          onCancel={closeRemoveConfirm}
          onConfirm={() => {
            void runAction(
              pendingRemove,
              "remove",
              () => apiFetch(`/waitlist/entries/${pendingRemove.id}`, { method: "DELETE" }),
              t("successRemove"),
            );
            setPendingRemove(null);
          }}
          t={t}
        />
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
