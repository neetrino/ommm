"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SessionReviewDetailsModal } from "@/components/session-reviews/session-review-details-modal";
import { SessionReviewRatingStars } from "@/components/session-reviews/session-review-rating-stars";
import type {
  ClientSheetFeedbackItem,
  ClientSheetPaginatedResponse,
} from "@/components/admin/admin-clients-types";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { apiFetch } from "@/lib/api";
import { formatSessionReviewWhen } from "@/lib/format-session-review-when";

const CLIENT_FEEDBACK_PAGE_SIZE = 3;

type ClientFeedbackPanelProps = {
  clientId: string;
  active: boolean;
  refreshKey?: number;
};

export function ClientFeedbackPanel({
  clientId,
  active,
  refreshKey = 0,
}: ClientFeedbackPanelProps) {
  const locale = useLocale();
  const t = useTranslations("adminPages.clients");
  const [page, setPage] = useState(1);
  const [prevClientId, setPrevClientId] = useState(clientId);
  const pageSize = CLIENT_FEEDBACK_PAGE_SIZE;
  const [result, setResult] = useState<{
    key: string;
    items: ClientSheetFeedbackItem[];
    total: number;
  } | null>(null);
  const [selected, setSelected] = useState<ClientSheetFeedbackItem | null>(null);

  if (clientId !== prevClientId) {
    setPrevClientId(clientId);
    setPage(1);
  }

  const fetchKey = `${clientId}:${page}:${pageSize}:${refreshKey}`;
  const loading = active && (result === null || result.key !== fetchKey);
  const items = result?.key === fetchKey ? result.items : [];
  const total = result?.key === fetchKey ? result.total : 0;
  const offset = (page - 1) * pageSize;

  useEffect(() => {
    if (!active) {
      return undefined;
    }
    let cancelled = false;
    void apiFetch<ClientSheetPaginatedResponse<ClientSheetFeedbackItem>>(
      `/clients/${clientId}/feedback?take=${pageSize}&offset=${offset}`,
    )
      .then((payload) => {
        if (!cancelled) {
          setResult({ key: fetchKey, items: payload.items, total: payload.total });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ key: fetchKey, items: [], total: 0 });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [active, clientId, fetchKey, offset, pageSize]);

  return (
    <section className="rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5">
      <p className="font-medium text-sage-900">{t("drawer.feedback")}</p>
      <div className="mt-3 space-y-3">
        {!loading && items.length === 0 ? (
          <p className="text-sm text-sage-500">{t("drawer.noFeedback")}</p>
        ) : null}
        {items.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => setSelected(row)}
            className="w-full rounded-2xl border border-sand-200/90 bg-white/90 px-4 py-3.5 text-left text-sm shadow-[0_10px_24px_-20px_rgba(45,40,35,0.28)] transition-[border-color,box-shadow,transform] hover:border-sand-300 hover:shadow-[0_14px_28px_-18px_rgba(45,40,35,0.32)] active:scale-[0.995]"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-sage-500">
              {formatSessionReviewWhen(locale, row.startsAt, row.endsAt)}
            </p>
            <p className="mt-1 font-medium text-sage-900">{row.classTypeName}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-sage-600">
              <SessionReviewRatingStars
                rating={row.rating}
                label={t("drawer.feedbackRating", { rating: row.rating })}
                sizeClassName="text-sm"
              />
              {row.coachName ? <span>{row.coachName}</span> : null}
            </div>
            {row.comment ? (
              <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm leading-relaxed text-sage-800">
                {row.comment}
              </p>
            ) : (
              <p className="mt-2 text-sm italic text-sage-500">{t("drawer.noFeedbackComment")}</p>
            )}
          </button>
        ))}
      </div>
      <OmmListPagination
        total={total}
        page={page}
        pageSize={pageSize}
        offset={offset}
        disabled={loading}
        onPageChange={setPage}
        scrollOnPageChange={false}
      />
      {selected ? (
        <SessionReviewDetailsModal
          row={selected}
          onClose={() => setSelected(null)}
          overlayZClassName="z-[120]"
        />
      ) : null}
    </section>
  );
}
