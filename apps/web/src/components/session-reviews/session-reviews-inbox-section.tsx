"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { SessionReviewInboxCard } from "@/components/session-reviews/session-review-inbox-card";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { parseListPageParams, syncListPageQuery } from "@/lib/list-pagination";
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
  const listPage = useMemo(
    () => parseListPageParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );
  const [payload, setPayload] = useState<SessionReviewsListPayload<
    StaffInboxReview | CoachInboxReview
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = sessionReviewsInboxQuery(listPage.take, listPage.offset);
      const data = await apiFetch<SessionReviewsListPayload<StaffInboxReview | CoachInboxReview>>(
        `${endpoint}?${query}`,
      );
      setPayload(data);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t("loadFailed"));
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [endpoint, listPage.offset, listPage.take, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const items = payload?.items ?? [];
  const total = payload?.total ?? 0;

  return (
    <StaffListPageLayout title={t("title")}>
      {loading ? <p className="text-sm text-sage-600">{t("loading")}</p> : null}
      {error ? <p className="text-sm text-amber-900">{error}</p> : null}
      {!loading && !error && items.length === 0 ? (
        <p className="rounded-2xl border border-sand-200/80 bg-white/80 px-5 py-10 text-center text-sm text-sage-600">
          {t("empty")}
        </p>
      ) : null}
      <div className="space-y-3">
        {items.map((row) => (
          <SessionReviewInboxCard
            key={row.id}
            row={row}
            showAnonymousBadge={showAnonymousBadge}
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
    </StaffListPageLayout>
  );
}
