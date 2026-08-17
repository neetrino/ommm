"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { OmmButton } from "@/components/ui/omm-button";
import { apiFetch } from "@/lib/api";
import {
  dispatchSessionReviewOpen,
  dispatchSessionReviewsRefresh,
} from "@/lib/session-reviews-events";
import { formatSessionReviewWhen } from "@/lib/format-session-review-when";
import { SESSION_REVIEW_HEADER_PREVIEW } from "@/lib/session-reviews-types";
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
  viewAllHref,
  onPick,
}: {
  items: readonly MemberPendingReview[];
  loading: boolean;
  error: boolean;
  viewAllHref: string;
  onPick: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("headerSessionReviews");
  const preview = items.slice(0, SESSION_REVIEW_HEADER_PREVIEW);
  return (
    <ReviewMenuShell
      title={t("memberTitle")}
      viewAllHref={viewAllHref}
      loading={loading}
      error={error}
      empty={preview.length === 0}
      onNavigate={onPick}
    >
      {preview.map((row) => (
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
  viewAllHref,
  onNavigate,
}: {
  items: readonly StaffInboxReview[];
  loading: boolean;
  error: boolean;
  viewAllHref: string;
  onNavigate: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("headerSessionReviews");
  return (
    <ReviewMenuShell
      title={t("staffTitle")}
      viewAllHref={viewAllHref}
      loading={loading}
      error={error}
      empty={items.length === 0}
      onNavigate={onNavigate}
    >
      {items.map((row) => (
        <StaffPreviewRow key={row.id} row={row} locale={locale} />
      ))}
    </ReviewMenuShell>
  );
}

export function CoachReviewMenuPanel({
  items,
  loading,
  error,
  viewAllHref,
  onNavigate,
}: {
  items: readonly CoachInboxReview[];
  loading: boolean;
  error: boolean;
  viewAllHref: string;
  onNavigate: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("headerSessionReviews");
  return (
    <ReviewMenuShell
      title={t("coachTitle")}
      viewAllHref={viewAllHref}
      loading={loading}
      error={error}
      empty={items.length === 0}
      onNavigate={onNavigate}
    >
      {items.map((row) => (
        <li key={row.id} className="border-b border-white/50 px-4 py-3 last:border-b-0">
          <p className="text-sm font-semibold text-sage-900">{row.classTypeName}</p>
          <p className="mt-0.5 text-xs text-sage-600">
            {formatSessionReviewWhen(locale, row.startsAt, row.endsAt)}
          </p>
          <p className="mt-1 text-xs text-sage-700">
            {t("ratingLabel", { rating: row.rating })} · {row.author.displayName}
          </p>
        </li>
      ))}
    </ReviewMenuShell>
  );
}

export async function markStaffReviewsRead(): Promise<void> {
  await apiFetch("/session-reviews/inbox/mark-read", { method: "POST" });
  dispatchSessionReviewsRefresh();
}

function StaffPreviewRow({
  row,
  locale,
}: {
  row: StaffInboxReview;
  locale: string;
}) {
  const t = useTranslations("headerSessionReviews");
  return (
    <li className="border-b border-white/50 px-4 py-3 last:border-b-0">
      <p className="text-sm font-semibold text-sage-900">{row.classTypeName}</p>
      <p className="mt-0.5 text-xs text-sage-600">
        {formatSessionReviewWhen(locale, row.startsAt, row.endsAt)}
      </p>
      <p className="mt-1 text-xs text-sage-700">
        {t("ratingLabel", { rating: row.rating })} · {row.author.displayName}
        {row.isAnonymous ? ` · ${t("hiddenFromCoach")}` : ""}
      </p>
    </li>
  );
}

function ReviewMenuShell({
  title,
  viewAllHref,
  loading,
  error,
  empty,
  onNavigate,
  children,
}: {
  title: string;
  viewAllHref: string;
  loading: boolean;
  error: boolean;
  empty: boolean;
  onNavigate: () => void;
  children: ReactNode;
}) {
  const t = useTranslations("headerSessionReviews");
  return (
    <>
      <div className="flex items-start justify-between gap-3 border-b border-white/60 px-4 py-3">
        <p className="text-sm font-semibold text-sage-900">{title}</p>
        <Link
          href={viewAllHref}
          className="text-xs font-medium text-sage-700 underline-offset-2 hover:underline"
          onClick={onNavigate}
        >
          {t("viewAll")}
        </Link>
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
