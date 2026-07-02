"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ADMIN_NOTIFICATIONS_SCHEDULED_SEARCH_DEBOUNCE_MS } from "@/components/admin/admin-notifications-scheduled-section.constants";
import { AdminNotificationsScheduledFilters } from "@/components/admin/admin-notifications-scheduled-filters";
import { AdminNotificationsScheduledList } from "@/components/admin/admin-notifications-scheduled-list";
import type { AdminNotificationsScheduledSectionProps } from "@/components/admin/admin-notifications-scheduled-section.constants";
import type { ScheduledQuickFilter } from "@/components/admin/admin-notifications-scheduled-section.constants";
import {
  AdminScheduledBroadcastEditModal,
  type ScheduledEditDraft,
} from "@/components/admin/admin-scheduled-broadcast-edit-modal";
import type { ScheduledBroadcast } from "@/components/admin/admin-notifications-types";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  ADMIN_NOTIFICATIONS_SCHEDULED_PAGE_KEYS,
  parseAdminNotificationsScheduledPageParams,
} from "@/components/admin/admin-notifications-query";
import {
  ADMIN_NOTIFICATIONS_SCHEDULED_FILTER_KEYS,
  buildScheduledFiltersQuery,
  defaultScheduledListFilters,
  type ScheduledListFilters,
} from "@/components/admin/admin-notifications-url";
import { usePropSyncedState } from "@/hooks/use-prop-synced-state";
import { resetListPageQuery, syncListPageQuery } from "@/lib/list-pagination";
import { ApiError, apiFetch } from "@/lib/api";
import { combineIsoDateAndTime, splitIsoDateTime } from "@/lib/date-display";

export type { AdminNotificationsScheduledSectionProps } from "@/components/admin/admin-notifications-scheduled-section.constants";

export function AdminNotificationsScheduledSection({
  locale,
  payload,
  loadFailed,
  initialFilters,
  onRefresh,
}: AdminNotificationsScheduledSectionProps) {
  const t = useTranslations("adminPages.notifications");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const items = payload.items;
  const listPage = parseAdminNotificationsScheduledPageParams(
    Object.fromEntries(searchParams.entries()),
  );
  const hasMounted = useRef(false);
  const syncFiltersToUrlRef = useRef<(values: ScheduledListFilters, resetPage?: boolean) => void>(
    () => undefined,
  );
  const filtersRef = useRef(initialFilters);
  const [filters, setFilters] = usePropSyncedState(initialFilters);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<ScheduledBroadcast | null>(null);
  const [editDraft, setEditDraft] = useState<ScheduledEditDraft>({
    subject: "",
    html: "",
    audience: "users",
    onlyPromotionsOptIn: false,
    scheduleDate: "",
    scheduleTime: "",
  });

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const syncFiltersToUrl = useCallback(
    (values: ScheduledListFilters, resetPage = false) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const key of ADMIN_NOTIFICATIONS_SCHEDULED_FILTER_KEYS) {
        params.delete(key);
      }
      if (resetPage) {
        resetListPageQuery(params, ADMIN_NOTIFICATIONS_SCHEDULED_PAGE_KEYS);
      }
      const filterQuery = buildScheduledFiltersQuery(values);
      if (filterQuery.length > 0) {
        for (const [key, value] of new URLSearchParams(filterQuery)) {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      if (qs === searchParams.toString()) {
        return;
      }
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    syncFiltersToUrlRef.current = syncFiltersToUrl;
  }, [syncFiltersToUrl]);

  function patchFilters(patch: Partial<ScheduledListFilters>, resetPage = true): void {
    const next = { ...filtersRef.current, ...patch };
    setFilters(next);
    syncFiltersToUrl(next, resetPage);
  }

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }
    const handle = window.setTimeout(() => {
      syncFiltersToUrlRef.current(filtersRef.current, true);
    }, ADMIN_NOTIFICATIONS_SCHEDULED_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [filters.search]);

  function resetFilters() {
    setFilters(defaultScheduledListFilters);
    syncFiltersToUrl(defaultScheduledListFilters, true);
  }

  function setListPage(page: number, pageSize?: number) {
    const params = new URLSearchParams(searchParams.toString());
    syncListPageQuery(params, page, pageSize, ADMIN_NOTIFICATIONS_SCHEDULED_PAGE_KEYS);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function openEdit(row: ScheduledBroadcast) {
    const { date, time } = splitIsoDateTime(row.scheduleAt);
    setEditing(row);
    setEditDraft({
      subject: row.subject,
      html: row.html,
      audience: row.audience,
      onlyPromotionsOptIn: row.onlyPromotionsOptIn,
      scheduleDate: date,
      scheduleTime: time,
    });
    setMessage(null);
  }

  async function cancel(id: string) {
    setBusyId(id);
    setMessage(null);
    try {
      await apiFetch(`/notifications/admin/scheduled/${id}`, { method: "DELETE" });
      setMessage(t("messages.scheduleCancelled"));
      onRefresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t("messages.cancelFailed"));
    } finally {
      setBusyId(null);
    }
  }

  async function saveEdit() {
    if (!editing) {
      return;
    }
    const scheduleIso = combineIsoDateAndTime(editDraft.scheduleDate, editDraft.scheduleTime);
    if (scheduleIso === null) {
      setMessage(t("messages.chooseScheduleFirst"));
      return;
    }
    setBusyId(editing.id);
    setMessage(null);
    try {
      await apiFetch(`/notifications/admin/scheduled/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          subject: editDraft.subject,
          html: editDraft.html,
          audience: editDraft.audience,
          onlyPromotionsOptIn: editDraft.onlyPromotionsOptIn,
          scheduleAt: scheduleIso,
        }),
      });
      setMessage(t("messages.scheduleUpdated"));
      setEditing(null);
      onRefresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t("messages.updateFailed"));
    } finally {
      setBusyId(null);
    }
  }

  function handleQuickFilter(value: ScheduledQuickFilter) {
    patchFilters({ quick: filters.quick === value ? "" : value });
  }

  return (
    <section className="space-y-4">
      <AdminNotificationsScheduledFilters
        filters={filters}
        total={payload.total}
        onSearchChange={(value) => setFilters((current) => ({ ...current, search: value }))}
        onQuickFilter={handleQuickFilter}
        onPatchFilters={patchFilters}
        onReset={resetFilters}
        t={t}
      />
      {loadFailed ? <p className="app-alert-warn text-sm">{t("loadFailedScheduled")}</p> : null}
      <AdminNotificationsScheduledList
        locale={locale}
        rows={items}
        totalItems={items.length}
        busyId={busyId}
        onEdit={openEdit}
        onCancel={(id) => void cancel(id)}
        t={t}
      />
      <OmmListPagination
        total={payload.total}
        page={listPage.page}
        pageSize={listPage.pageSize}
        offset={payload.offset}
        onPageChange={setListPage}
        disabled={busyId !== null}
      />
      {message ? (
        <p className="text-sm text-sage-700" role="status">
          {message}
        </p>
      ) : null}
      {editing ? (
        <AdminScheduledBroadcastEditModal
          editing={editing}
          draft={editDraft}
          busy={busyId !== null}
          onDraftChange={setEditDraft}
          onSave={() => void saveEdit()}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </section>
  );
}
