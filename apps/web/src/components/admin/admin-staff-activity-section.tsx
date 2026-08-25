"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { AdminStaffActivityCard } from "@/components/admin/admin-staff-activity-card";
import { AdminStaffActivityDetailsModal } from "@/components/admin/admin-staff-activity-details-modal";
import { AdminStaffActivityEmptyState } from "@/components/admin/admin-staff-activity-empty-state";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { markStaffActivityRead } from "@/hooks/use-staff-activity-inbox";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import {
  HEADER_ICONS_UI_PREVIEW,
  HEADER_PREVIEW_STAFF_ACTIVITY,
} from "@/lib/header-icons-ui-preview";
import { parseListPageParams, syncListPageQuery } from "@/lib/list-pagination";
import type {
  StaffActivityListPayload,
  StaffActivityRow,
} from "@/lib/staff-activity-types";
import { STAFF_ACTIVITY_PAGE_TAKE } from "@/lib/staff-activity-types";

const SEARCH_DEBOUNCE_MS = 280;

export function AdminStaffActivitySection() {
  const t = useTranslations("staffActivityPages");
  const router = useRouter();
  const searchParams = useSearchParams();
  const listPage = useMemo(
    () =>
      parseListPageParams(Object.fromEntries(searchParams.entries()), {
        defaultPageSize: STAFF_ACTIVITY_PAGE_TAKE,
      }),
    [searchParams],
  );
  const urlQuery = searchParams.get("q")?.trim() ?? "";
  const [searchDraft, setSearchDraft] = useState(urlQuery);
  const [payload, setPayload] = useState<StaffActivityListPayload | null>(() =>
    HEADER_ICONS_UI_PREVIEW
      ? {
          items: HEADER_PREVIEW_STAFF_ACTIVITY,
          total: HEADER_PREVIEW_STAFF_ACTIVITY.length,
          take: STAFF_ACTIVITY_PAGE_TAKE,
          offset: 0,
        }
      : null,
  );
  const [loading, setLoading] = useState(!HEADER_ICONS_UI_PREVIEW);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<StaffActivityRow | null>(null);

  useEffect(() => {
    setSearchDraft(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    if (searchDraft === urlQuery) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const next = searchDraft.trim();
      if (next.length === 0) {
        params.delete("q");
      } else {
        params.set("q", next);
      }
      syncListPageQuery(params, 1, listPage.pageSize);
      const query = params.toString();
      router.replace(query.length > 0 ? `?${query}` : "?");
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [listPage.pageSize, router, searchDraft, searchParams, urlQuery]);

  const load = useCallback(async () => {
    if (HEADER_ICONS_UI_PREVIEW) {
      setPayload({
        items: HEADER_PREVIEW_STAFF_ACTIVITY,
        total: HEADER_PREVIEW_STAFF_ACTIVITY.length,
        take: listPage.take,
        offset: listPage.offset,
      });
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<StaffActivityListPayload>(
        `/staff-activity?take=${listPage.take}&offset=${listPage.offset}`,
      );
      setPayload(data);
      void markStaffActivityRead();
    } catch (caught) {
      setPayload(null);
      setError(caught instanceof ApiError ? caught.message : t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [listPage.offset, listPage.take, t]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const filteredItems = useMemo(() => {
    const items = payload?.items ?? [];
    const q = urlQuery.toLowerCase();
    if (q.length === 0) {
      return items;
    }
    return items.filter((row) => {
      const typeKey = row.type === "BOOKING_CREATED" ? "booked" : "cancelled";
      return (
        row.memberName.toLowerCase().includes(q) ||
        row.className.toLowerCase().includes(q) ||
        typeKey.includes(q)
      );
    });
  }, [payload?.items, urlQuery]);

  const total = HEADER_ICONS_UI_PREVIEW
    ? filteredItems.length
    : (payload?.total ?? 0);
  const showEmpty = !loading && !error && filteredItems.length === 0;

  return (
    <StaffListPageLayout
      title={t("title")}
      search={
        <ListPageSearchFilters
          search={searchDraft}
          onSearchChange={setSearchDraft}
          searchPlaceholder={t("searchPlaceholder")}
          fields={[]}
          filterValues={{}}
          onFilterChange={() => undefined}
          onClearAll={() => setSearchDraft("")}
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
      {filteredItems.length > 0 ? (
        <div className="space-y-3" aria-busy={loading}>
          {filteredItems.map((row) => (
            <AdminStaffActivityCard
              key={row.id}
              row={row}
              onOpen={() => setSelected(row)}
            />
          ))}
        </div>
      ) : null}
      {!HEADER_ICONS_UI_PREVIEW && total > listPage.pageSize ? (
        <OmmListPagination
          total={total}
          page={listPage.page}
          pageSize={listPage.pageSize}
          offset={listPage.offset}
          onPageChange={(page) => {
            const params = new URLSearchParams(searchParams.toString());
            syncListPageQuery(params, page, listPage.pageSize);
            const query = params.toString();
            router.replace(query.length > 0 ? `?${query}` : "?");
          }}
        />
      ) : null}
      {selected ? (
        <AdminStaffActivityDetailsModal
          row={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </StaffListPageLayout>
  );
}
