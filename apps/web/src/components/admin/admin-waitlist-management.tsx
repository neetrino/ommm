"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { usePropSyncedState } from "@/hooks/use-prop-synced-state";
import { useRealtimeRefetch } from "@/hooks/use-realtime-refetch";
import { REALTIME_REFETCH_KEYS } from "@/lib/realtime/realtime-refetch-keys";
import { AdminWaitlistEmptyState } from "@/components/admin/admin-waitlist-empty-state";
import { AdminWaitlistListBody } from "@/components/admin/admin-waitlist-list-body";
import { AdminWaitlistLoadErrorShell } from "@/components/admin/admin-waitlist-load-error-shell";
import { useAdminWaitlistFilterFields } from "@/components/admin/admin-waitlist-filter-fields";
import { useAdminWaitlistFilters } from "@/components/admin/use-admin-waitlist-filters";
import type { AdminWaitlistToastTone } from "@/components/admin/admin-waitlist-management.constants";
import { AdminWaitlistRemoveConfirmModal } from "@/components/admin/admin-waitlist-remove-confirm-modal";
import { AdminWaitlistToast } from "@/components/admin/admin-waitlist-toast";
import { formatAdminWaitlistUserLabel } from "@/components/admin/admin-waitlist-user-label";
import type { AdminWaitlistManagementProps } from "@/components/admin/admin-waitlist-management.types";
import {
  buildAdminWaitlistActiveEndpoint,
  type AdminWaitlistActivePayload,
  type AdminWaitlistRow,
} from "@/components/admin/admin-waitlist-query";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { AdminUserDetailsDrawer } from "@/components/admin/admin-user-details-drawer";
import { useCloseOnEscape } from "@/hooks/use-close-on-escape";
import { useAdminListPageParams } from "@/hooks/use-admin-list-page-params";
import { useRouter } from "@/i18n/navigation";

export function AdminWaitlistManagement({
  locale,
  initial,
  initialLoadError,
  staffBanner,
}: AdminWaitlistManagementProps) {
  const t = useTranslations("adminPages.waitlists");
  const router = useRouter();
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
  } = useAdminWaitlistFilters();
  const waitlistFilterFields = useAdminWaitlistFilterFields({ items: payload.items });

  const { listPage, setListPage } = useAdminListPageParams();

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

  useEffect(() => {
    if (payload.take === listPage.take && payload.offset === listPage.offset) {
      return;
    }
    queueMicrotask(() => {
      void loadRows();
    });
  }, [loadRows, listPage.offset, listPage.take, payload.offset, payload.take]);

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
      <AdminWaitlistLoadErrorShell
        staffBanner={staffBanner}
        loadError={loadError}
        onRetry={() => void loadRows()}
      />
    );
  }

  const waitlistBody = !hasRows ? (
    <AdminWaitlistEmptyState />
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

      {toast ? <AdminWaitlistToast toast={toast} /> : null}

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
