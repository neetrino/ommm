"use client";

import { useLocale, useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import {
  dispatchSessionReviewOpen,
  dispatchSessionReviewsRefresh,
} from "@/lib/session-reviews-events";
import { formatSessionReviewWhen } from "@/lib/format-session-review-when";
import type {
  CoachInboxReview,
  MemberPendingReview,
  StaffInboxReview,
} from "@/lib/session-reviews-types";
import type { ReactNode } from "react";

export function MemberReviewMenuPanel({
  items,
  loading,
  error,
  onPick,
}: {
  items: readonly MemberPendingReview[];
  loading: boolean;
  error: boolean;
  onPick: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("headerSessionReviews");
  return (
    <ReviewMenuShell title={t("memberTitle")} loading={loading} error={error} empty={items.length === 0}>
      {items.map((row) => (
        <li key={row.id} className="border-b border-white/50 px-4 py-3 last:border-b-0">
          <p className="text-sm font-semibold text-sage-900">{row.classTypeName}</p>
          <p className="mt-0.5 text-xs text-sage-600">
            {formatSessionReviewWhen(locale, row.startsAt, row.endsAt)}
          </p>
          <OmmButton
            type="button"
            size="sm"
            variant="primary"
            className="mt-2"
            onClick={() => {
              dispatchSessionReviewOpen(row.id);
              onPick();
            }}
          >
            {t("writeReview")}
          </OmmButton>
        </li>
      ))}
    </ReviewMenuShell>
  );
}

export function StaffReviewMenuPanel({
  items,
  loading,
  error,
}: {
  items: readonly StaffInboxReview[];
  loading: boolean;
  error: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("headerSessionReviews");
  return (
    <ReviewMenuShell title={t("staffTitle")} loading={loading} error={error} empty={items.length === 0}>
      {items.map((row) => (
        <li key={row.id} className="border-b border-white/50 px-4 py-3 last:border-b-0">
          <p className="text-sm font-semibold text-sage-900">{row.classTypeName}</p>
          <p className="mt-0.5 text-xs text-sage-600">
            {formatSessionReviewWhen(locale, row.startsAt, row.endsAt)}
          </p>
          <p className="mt-1 text-xs text-sage-700">
            {t("ratingLabel", { rating: row.rating })} · {row.author.displayName}
            {row.isAnonymous ? ` · ${t("hiddenFromCoach")}` : ""}
          </p>
          {row.comment ? (
            <p className="mt-1 line-clamp-3 text-xs text-sage-800">{row.comment}</p>
          ) : null}
        </li>
      ))}
    </ReviewMenuShell>
  );
}

export function CoachReviewMenuPanel({
  items,
  loading,
  error,
}: {
  items: readonly CoachInboxReview[];
  loading: boolean;
  error: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("headerSessionReviews");
  return (
    <ReviewMenuShell title={t("coachTitle")} loading={loading} error={error} empty={items.length === 0}>
      {items.map((row) => (
        <li key={row.id} className="border-b border-white/50 px-4 py-3 last:border-b-0">
          <p className="text-sm font-semibold text-sage-900">{row.classTypeName}</p>
          <p className="mt-0.5 text-xs text-sage-600">
            {formatSessionReviewWhen(locale, row.startsAt, row.endsAt)}
          </p>
          <p className="mt-1 text-xs text-sage-700">
            {t("ratingLabel", { rating: row.rating })} · {row.author.displayName}
          </p>
          {row.comment ? (
            <p className="mt-1 line-clamp-3 text-xs text-sage-800">{row.comment}</p>
          ) : null}
        </li>
      ))}
    </ReviewMenuShell>
  );
}

export async function markStaffReviewsRead(): Promise<void> {
  await apiFetch("/session-reviews/inbox/mark-read", { method: "POST" });
  dispatchSessionReviewsRefresh();
}

function ReviewMenuShell({
  title,
  loading,
  error,
  empty,
  children,
}: {
  title: string;
  loading: boolean;
  error: boolean;
  empty: boolean;
  children: ReactNode;
}) {
  const t = useTranslations("headerSessionReviews");
  return (
    <>
      <div className="border-b border-white/60 px-4 py-3">
        <p className="text-sm font-semibold text-sage-900">{title}</p>
      </div>
      <ul className="max-h-72 list-none overflow-y-auto p-0">
        {loading ? (
          <li className="px-4 py-6 text-center text-sm text-sage-500">{t("loading")}</li>
        ) : error ? (
          <li className="px-4 py-6 text-center text-sm text-amber-900">{t("loadError")}</li>
        ) : empty ? (
          <li className="px-4 py-6 text-center text-sm text-sage-500">{t("empty")}</li>
        ) : (
          children
        )}
      </ul>
    </>
  );
}
