"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { AdminCallTasksEmptyState } from "@/components/admin/admin-call-tasks-empty-state";
import { useAdminCallTasksFilterFields } from "@/components/admin/admin-call-tasks-filter-fields";
import {
  AdminCallTasksFormModal,
  contactNameFromDraft,
  draftFromCallTask,
  emptyCallTaskDraft,
  type CallTaskFormDraft,
} from "@/components/admin/admin-call-tasks-form-modal";
import { AdminCallTasksDetailsSheet } from "@/components/admin/admin-call-tasks-details-sheet";
import { AdminCallTasksListBody } from "@/components/admin/admin-call-tasks-list-body";
import { AdminWaitlistLoadErrorShell } from "@/components/admin/admin-waitlist-load-error-shell";
import { AdminWaitlistToast } from "@/components/admin/admin-waitlist-toast";
import type { AdminWaitlistToastTone } from "@/components/admin/admin-waitlist-management.constants";
import type { AdminCallTasksManagementProps } from "@/components/admin/admin-call-tasks-management.types";
import { useAdminCallTasksFilters } from "@/components/admin/use-admin-call-tasks-filters";
import {
  buildCallTasksListEndpoint,
  CALL_TASK_SEARCH_QUERY_KEY,
  CALL_TASKS_PAGE_TAKE,
  type CallTaskListPayload,
  type CallTaskRow,
} from "@/components/admin/admin-call-tasks-query";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { OmmButton } from "@/components/ui/omm-button";
import { useCallTasksPendingCount } from "@/hooks/use-call-tasks-pending-count";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { dispatchCallTasksRefresh } from "@/lib/call-tasks-refresh-event";
import { parseListPageParams, syncListPageQuery } from "@/lib/list-pagination";

export function AdminCallTasksManagement({
  initial,
  initialLoadError,
}: AdminCallTasksManagementProps) {
  const t = useTranslations("adminPages.calls");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(initialLoadError);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [toast, setToast] = useState<{ tone: AdminWaitlistToastTone; message: string } | null>(
    null,
  );
  const [formOpen, setFormOpen] = useState<"create" | CallTaskRow | null>(null);
  const [detailsRow, setDetailsRow] = useState<CallTaskRow | null>(null);
  const [draft, setDraft] = useState<CallTaskFormDraft>(emptyCallTaskDraft);
  const [markingBadge, setMarkingBadge] = useState(false);
  const [, startRefreshTransition] = useTransition();
  const refreshRequestId = useRef(0);
  const badgeCount = useCallTasksPendingCount(true);
  const filterFields = useAdminCallTasksFilterFields();
  const {
    searchDraft,
    setSearchDraft,
    statusFilter,
    filterValues,
    handleFilterChange,
    resetFilters,
    replaceSearchParams,
  } = useAdminCallTasksFilters();

  const listPage = useMemo(
    () =>
      parseListPageParams(Object.fromEntries(searchParams.entries()), {
        defaultPageSize: CALL_TASKS_PAGE_TAKE,
      }),
    [searchParams],
  );
  const urlQuery = searchParams.get(CALL_TASK_SEARCH_QUERY_KEY)?.trim() ?? "";

  const loadRows = useCallback(async () => {
    const requestId = ++refreshRequestId.current;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiFetch<CallTaskListPayload>(
        buildCallTasksListEndpoint({
          take: listPage.take,
          offset: listPage.offset,
          q: urlQuery,
          status: statusFilter,
        }),
      );
      if (requestId !== refreshRequestId.current) {
        return;
      }
      setPayload(data);
      setDetailsRow((current) => {
        if (current === null) {
          return null;
        }
        return data.items.find((item) => item.id === current.id) ?? current;
      });
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
  }, [listPage.offset, listPage.take, setPayload, statusFilter, t, urlQuery]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadRows();
    });
  }, [loadRows]);

  async function markBadgeRead() {
    if (markingBadge || badgeCount === 0) {
      return;
    }
    setMarkingBadge(true);
    try {
      await apiFetch("/call-tasks/mark-badge-read", { method: "POST" });
      dispatchCallTasksRefresh();
    } catch (error) {
      setToast({
        tone: "err",
        message: error instanceof ApiError ? error.message : t("actionFailed"),
      });
    } finally {
      setMarkingBadge(false);
    }
  }

  async function runRowAction(
    row: CallTaskRow,
    action: "complete" | "cancel",
    path: string,
    success: string,
  ) {
    if (busyAction !== null) {
      return;
    }
    setBusyAction(`${row.id}:${action}`);
    try {
      await apiFetch(path, { method: "POST" });
      setToast({ tone: "ok", message: success });
      setDetailsRow(null);
      await loadRows();
      dispatchCallTasksRefresh();
      startRefreshTransition(() => router.refresh());
    } catch (error) {
      setToast({
        tone: "err",
        message: error instanceof ApiError ? error.message : t("actionFailed"),
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function submitForm() {
    if (busyAction !== null || formOpen === null) {
      return;
    }
    setBusyAction("form");
    try {
      const body = {
        contactName: contactNameFromDraft(draft),
        phone: draft.phone.trim(),
        comment: draft.comment.trim(),
        dueOn: draft.dueOn,
      };
      if (formOpen === "create") {
        await apiFetch("/call-tasks", {
          method: "POST",
          body: JSON.stringify(body),
        });
        setToast({ tone: "ok", message: t("created") });
      } else {
        await apiFetch(`/call-tasks/${formOpen.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        setToast({ tone: "ok", message: t("updated") });
      }
      setFormOpen(null);
      await loadRows();
      dispatchCallTasksRefresh();
      startRefreshTransition(() => router.refresh());
    } catch (error) {
      setToast({
        tone: "err",
        message: error instanceof ApiError ? error.message : t("actionFailed"),
      });
    } finally {
      setBusyAction(null);
    }
  }

  if (loadError && payload.items.length === 0) {
    return (
      <AdminWaitlistLoadErrorShell loadError={loadError} onRetry={() => void loadRows()} />
    );
  }

  return (
    <>
      <StaffListPageLayout
        title={t("title")}
        headerTrailing={
          <OmmButton
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              setDraft(emptyCallTaskDraft());
              setFormOpen("create");
            }}
          >
            {t("create")}
          </OmmButton>
        }
        search={
          <ListPageSearchFilters
            search={searchDraft}
            onSearchChange={setSearchDraft}
            searchPlaceholder={t("searchPlaceholder")}
            fields={filterFields}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            onClearAll={resetFilters}
            resetLabel={t("resetFilters")}
          />
        }
      >
        {payload.items.length === 0 && !loading ? (
          <AdminCallTasksEmptyState />
        ) : (
          <AdminCallTasksListBody
            rows={payload.items}
            total={payload.total}
            listPage={listPage}
            offset={listPage.offset}
            badgeCount={badgeCount}
            markingBadge={markingBadge}
            onMarkBadgeRead={() => void markBadgeRead()}
            onOpenDetails={setDetailsRow}
            onPageChange={(page) => {
              replaceSearchParams((params) => {
                syncListPageQuery(params, page);
              });
            }}
          />
        )}
      </StaffListPageLayout>
      {detailsRow !== null ? (
        <AdminCallTasksDetailsSheet
          row={detailsRow}
          busy={busyAction !== null}
          onClose={() => setDetailsRow(null)}
          onComplete={() =>
            void runRowAction(
              detailsRow,
              "complete",
              `/call-tasks/${detailsRow.id}/complete`,
              t("completed"),
            )
          }
          onEdit={() => {
            setDraft(draftFromCallTask(detailsRow));
            setFormOpen(detailsRow);
          }}
          onCancel={() =>
            void runRowAction(
              detailsRow,
              "cancel",
              `/call-tasks/${detailsRow.id}/cancel`,
              t("cancelled"),
            )
          }
        />
      ) : null}
      {formOpen !== null ? (
        <AdminCallTasksFormModal
          mode={formOpen === "create" ? "create" : "edit"}
          draft={draft}
          busy={busyAction === "form"}
          onChange={setDraft}
          onClose={() => setFormOpen(null)}
          onSubmit={() => void submitForm()}
        />
      ) : null}
      <AdminWaitlistToast toast={toast} />
    </>
  );
}
