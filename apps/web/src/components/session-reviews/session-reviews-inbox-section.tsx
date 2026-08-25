"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { SessionReviewDetailsModal } from "@/components/session-reviews/session-review-details-modal";
import { SessionReviewInboxCard } from "@/components/session-reviews/session-review-inbox-card";
import { useSessionReviewsFilterOptions } from "@/components/session-reviews/use-session-reviews-filter-options";
import { useSessionReviewsInboxFilterFields } from "@/components/session-reviews/use-session-reviews-inbox-filter-fields";
import { useSessionReviewsInboxFilters } from "@/components/session-reviews/use-session-reviews-inbox-filters";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { MarkAllAsReadIcon } from "@/components/shell/mark-all-as-read-button";
import { markStaffReviewsRead } from "@/components/shell/header-session-reviews-panels";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { parseListPageParams, syncListPageQuery } from "@/lib/list-pagination";
import { SESSION_REVIEW_SEARCH_QUERY_KEY } from "@/lib/session-reviews-inbox-filters";
import { sessionReviewsInboxQuery } from "@/lib/session-reviews-list";
import type {
  CoachInboxReview,
  SessionReviewsListPayload,
  StaffInboxReview,
} from "@/lib/session-reviews-types";

type SessionReviewsInboxSectionProps = {
  endpoint: "/session-reviews/inbox" | "/session-reviews/coach";
  showAnonymousBadge: boolean;
};

export function SessionReviewsInboxSection({
  endpoint,
  showAnonymousBadge,
}: SessionReviewsInboxSectionProps) {
  const t = useTranslations("sessionReviewsPages");
  const router = useRouter();
  const searchParams = useSearchParams();
  const showCoachFilter = endpoint === "/session-reviews/inbox";
  const isStaffInbox = endpoint === "/session-reviews/inbox";
  const listPage = useMemo(
    () => parseListPageParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );
  const filterOptions = useSessionReviewsFilterOptions();
  const filterFields = useSessionReviewsInboxFilterFields({
    showVisibilityFilter: showAnonymousBadge,
    showCoachFilter,
    coaches: filterOptions.coaches,
    packages: filterOptions.packages,
  });
  const {
    searchDraft,
    setSearchDraft,
    ratingFilter,
    visibilityFilter,
    coachFilter,
    packageFilter,
    filterValues,
    handleFilterChange,
    resetFilters,
  } = useSessionReviewsInboxFilters(showAnonymousBadge);
  const [payload, setPayload] = useState<SessionReviewsListPayload<
    StaffInboxReview | CoachInboxReview
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<StaffInboxReview | CoachInboxReview | null>(null);
  const [markingRead, setMarkingRead] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = sessionReviewsInboxQuery(listPage.take, listPage.offset, {
        q: searchParams.get(SESSION_REVIEW_SEARCH_QUERY_KEY)?.trim() ?? "",
        rating: ratingFilter,
        visibility: showAnonymousBadge ? visibilityFilter : "",
        coachId: showCoachFilter ? coachFilter : "",
        packagePlanId: packageFilter,
      });
      const listPromise = apiFetch<SessionReviewsListPayload<StaffInboxReview | CoachInboxReview>>(
        `${endpoint}?${query}`,
      );
      if (isStaffInbox) {
        const [data, unread] = await Promise.all([
          listPromise,
          apiFetch<{ count: number }>("/session-reviews/inbox/unread-count"),
        ]);
        setPayload(data);
        setHasUnread(unread.count > 0);
      } else {
        setPayload(await listPromise);
        setHasUnread(false);
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t("loadFailed"));
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [
    coachFilter,
    endpoint,
    isStaffInbox,
    listPage.offset,
    listPage.take,
    packageFilter,
    ratingFilter,
    searchParams,
    showAnonymousBadge,
    showCoachFilter,
    t,
    visibilityFilter,
  ]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const clearUnreadBadge = useCallback(async () => {
    if (!isStaffInbox || markingRead || !hasUnread) {
      return;
    }
    setMarkingRead(true);
    try {
      await markStaffReviewsRead();
      setHasUnread(false);
    } catch {
      setError(t("loadFailed"));
    } finally {
      setMarkingRead(false);
    }
  }, [hasUnread, isStaffInbox, markingRead, t]);

  const items = payload?.items ?? [];
  const total = payload?.total ?? 0;

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
      {!loading && !error && items.length === 0 ? (
        <p className="rounded-2xl border border-sand-200/80 bg-white/80 px-5 py-10 text-center text-sm text-sage-600">
          {t("empty")}
        </p>
      ) : null}
      <div className="space-y-3" aria-busy={loading}>
        {isStaffInbox && items.length > 0 ? (
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
        ) : null}
        {items.map((row) => (
          <SessionReviewInboxCard
            key={row.id}
            row={row}
            showAnonymousBadge={showAnonymousBadge}
            onOpen={() => setSelected(row)}
          />
        ))}
      </div>
      {total > listPage.pageSize ? (
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
        <SessionReviewDetailsModal
          row={selected}
          showAnonymousBadge={showAnonymousBadge}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </StaffListPageLayout>
  );
}
