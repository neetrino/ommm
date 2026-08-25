"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { AdminStaffActivityCard } from "@/components/admin/admin-staff-activity-card";
import { AdminStaffActivityDetailsModal } from "@/components/admin/admin-staff-activity-details-modal";
import { AdminStaffActivityEmptyState } from "@/components/admin/admin-staff-activity-empty-state";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { MarkAllAsReadIcon } from "@/components/shell/mark-all-as-read-button";
import { markStaffActivityRead } from "@/hooks/use-staff-activity-inbox";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
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
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setSearchDraft(urlQuery);
  }
  const [payload, setPayload] = useState<StaffActivityListPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<StaffActivityRow | null>(null);
  const [markingRead, setMarkingRead] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

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
    setLoading(true);
    setError(null);
    try {
      const [data, unread] = await Promise.all([
        apiFetch<StaffActivityListPayload>(
          `/staff-activity?take=${listPage.take}&offset=${listPage.offset}`,
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
  }, [listPage.offset, listPage.take, t]);

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

  const total = payload?.total ?? 0;
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
          {filteredItems.map((row) => (
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
          const params = new URLSearchParams(searchParams.toString());
          syncListPageQuery(params, page, listPage.pageSize);
          const query = params.toString();
          router.replace(query.length > 0 ? `?${query}` : "?");
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
