"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminStaffActivityCard } from "@/components/admin/admin-staff-activity-card";
import { AdminStaffActivityDetailsModal } from "@/components/admin/admin-staff-activity-details-modal";
import { AdminStaffActivityEmptyState } from "@/components/admin/admin-staff-activity-empty-state";
import { useAdminStaffActivityFilterFields } from "@/components/admin/admin-staff-activity-filter-fields";
import { useAdminStaffActivityFilters } from "@/components/admin/use-admin-staff-activity-filters";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { MarkAllAsReadIcon } from "@/components/shell/mark-all-as-read-button";
import { markStaffActivityRead } from "@/hooks/use-staff-activity-inbox";
import { useAdminListPageParams } from "@/hooks/use-admin-list-page-params";
import { ApiError, apiFetch } from "@/lib/api";
import { buildStaffActivityListEndpoint } from "@/lib/staff-activity-filters";
import type {
  StaffActivityListPayload,
  StaffActivityRow,
} from "@/lib/staff-activity-types";
import { STAFF_ACTIVITY_PAGE_TAKE } from "@/lib/staff-activity-types";

export function AdminStaffActivitySection() {
  const t = useTranslations("staffActivityPages");
  const filterFields = useAdminStaffActivityFilterFields();
  const {
    searchDraft,
    setSearchDraft,
    urlQuery,
    typeFilter,
    filterValues,
    handleFilterChange,
    resetFilters,
  } = useAdminStaffActivityFilters();
  const { listPage, setListPage } = useAdminListPageParams({
    defaultPageSize: STAFF_ACTIVITY_PAGE_TAKE,
  });
  const [payload, setPayload] = useState<StaffActivityListPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<StaffActivityRow | null>(null);
  const [markingRead, setMarkingRead] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, unread] = await Promise.all([
        apiFetch<StaffActivityListPayload>(
          buildStaffActivityListEndpoint({
            take: listPage.take,
            offset: listPage.offset,
            q: urlQuery,
            type: typeFilter,
          }),
        ),
        apiFetch<{ count: number }>("/staff-activity/unread-count"),
      ]);
      setPayload(data);
      setHasUnread(unread.count > 0);
    } catch (caught) {
      setPayload(null);
      setError(caught instanceof ApiError ? caught.message : t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [listPage.offset, listPage.take, t, typeFilter, urlQuery]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const clearUnreadBadge = useCallback(async () => {
    if (markingRead || !hasUnread) {
      return;
    }
    setMarkingRead(true);
    try {
      await markStaffActivityRead();
      setHasUnread(false);
    } catch {
      setError(t("loadFailed"));
    } finally {
      setMarkingRead(false);
    }
  }, [hasUnread, markingRead, t]);

  const items = payload?.items ?? [];
  const total = payload?.total ?? 0;
  const showEmpty = !loading && !error && items.length === 0;

  return (
    <StaffListPageLayout
      title={t("title")}
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
      {loading ? (
        <p className="sr-only" aria-live="polite">
          {t("loading")}
        </p>
      ) : null}
      {error ? <p className="text-sm text-amber-900">{error}</p> : null}
      {showEmpty ? <AdminStaffActivityEmptyState /> : null}
      {items.length > 0 ? (
        <div className="space-y-3" aria-busy={loading}>
          <div className="flex justify-start">
            <OmmButton
              type="button"
              variant="secondary"
              size="sm"
              className="inline-flex items-center gap-1.5"
              disabled={markingRead || !hasUnread}
              onClick={() => void clearUnreadBadge()}
            >
              <MarkAllAsReadIcon className="h-3.5 w-3.5" />
              {t("markAllRead")}
            </OmmButton>
          </div>
          {items.map((row) => (
            <AdminStaffActivityCard
              key={row.id}
              row={row}
              onOpen={() => setSelected(row)}
            />
          ))}
        </div>
      ) : null}
      <OmmListPagination
        total={total}
        page={listPage.page}
        pageSize={listPage.pageSize}
        offset={listPage.offset}
        onPageChange={(page) => {
          setListPage(page);
        }}
      />
      {selected ? (
        <AdminStaffActivityDetailsModal
          row={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </StaffListPageLayout>
  );
}
