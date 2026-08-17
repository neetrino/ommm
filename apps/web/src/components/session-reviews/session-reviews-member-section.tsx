"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SessionReviewPromptModal } from "@/components/account/session-review-prompt-modal";
import { AdminPillTabs } from "@/components/admin/admin-pill-tabs";
import { SessionReviewDetailsModal } from "@/components/session-reviews/session-review-details-modal";
import { SessionReviewRatingStars } from "@/components/session-reviews/session-review-rating-stars";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { OmmButton } from "@/components/ui/omm-button";
import { useSessionReviewsPending } from "@/hooks/use-session-reviews-pending";
import { useSessionReviewsSubmitted } from "@/hooks/use-session-reviews-submitted";
import { formatSessionReviewWhen } from "@/lib/format-session-review-when";
import type {
  MemberPendingReview,
  MemberSubmittedReview,
} from "@/lib/session-reviews-types";

type MemberReviewsTab = "pending" | "submitted";

export function SessionReviewsMemberSection() {
  const locale = useLocale();
  const t = useTranslations("sessionReviewsPages");
  const pending = useSessionReviewsPending(true);
  const submitted = useSessionReviewsSubmitted(true);
  const [tab, setTab] = useState<MemberReviewsTab>("pending");
  const [activePending, setActivePending] = useState<MemberPendingReview | null>(
    null,
  );
  const [activeSubmitted, setActiveSubmitted] =
    useState<MemberSubmittedReview | null>(null);

  const loading = tab === "pending" ? pending.loading : submitted.loading;
  const error = tab === "pending" ? pending.error : submitted.error;
  const emptyMessage =
    tab === "pending" ? t("memberEmpty") : t("memberSubmittedEmpty");
  const isEmpty =
    !loading &&
    !error &&
    (tab === "pending" ? pending.items.length === 0 : submitted.items.length === 0);

  async function refreshBoth() {
    await Promise.all([pending.refetch(), submitted.refetch()]);
  }

  return (
    <>
      <StaffListPageLayout title={t("memberTitle")}>
        <AdminPillTabs
          items={[
            {
              id: "pending",
              label: t("memberTabPending", { count: pending.items.length }),
            },
            {
              id: "submitted",
              label: t("memberTabSubmitted", { count: submitted.items.length }),
            },
          ]}
          activeId={tab}
          onChange={(id) => setTab(id as MemberReviewsTab)}
          ariaLabel={t("memberTabsAria")}
        />
        <div className="mt-5">
          {loading ? (
            <p className="sr-only">{t("loading")}</p>
          ) : null}
          {error ? <p className="text-sm text-amber-900">{t("loadFailed")}</p> : null}
          {isEmpty ? (
            <p className="rounded-2xl border border-sand-200/80 bg-white/80 px-5 py-10 text-center text-sm text-sage-600">
              {emptyMessage}
            </p>
          ) : null}
          {tab === "pending" ? (
            <div className="space-y-3">
              {pending.items.map((row) => (
                <article
                  key={row.id}
                  className="rounded-2xl border border-sand-200/80 bg-white/90 p-5 shadow-[0_12px_28px_-22px_rgba(45,40,35,0.2)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-sage-500">
                    {formatSessionReviewWhen(locale, row.startsAt, row.endsAt)}
                  </p>
                  <h2 className="mt-1 font-serif text-xl text-sage-900">
                    {row.classTypeName}
                  </h2>
                  {row.coachName ? (
                    <p className="mt-1 text-sm text-sage-600">{row.coachName}</p>
                  ) : null}
                  <OmmButton
                    type="button"
                    size="sm"
                    variant="primary"
                    className="mt-3"
                    onClick={() => setActivePending(row)}
                  >
                    {t("writeReview")}
                  </OmmButton>
                </article>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {submitted.items.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setActiveSubmitted(row)}
                  className="w-full rounded-2xl border border-sand-200/80 bg-white/90 p-5 text-left shadow-[0_12px_28px_-22px_rgba(45,40,35,0.2)] transition-[border-color,box-shadow] hover:border-sand-300"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-sage-500">
                    {formatSessionReviewWhen(locale, row.startsAt, row.endsAt)}
                  </p>
                  <h2 className="mt-1 font-serif text-xl text-sage-900">
                    {row.classTypeName}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <SessionReviewRatingStars
                      rating={row.rating}
                      label={t("ratingLabel", { rating: row.rating })}
                      sizeClassName="text-base"
                    />
                    {row.coachName ? (
                      <p className="text-sm text-sage-600">{row.coachName}</p>
                    ) : null}
                  </div>
                  {row.isAnonymous ? (
                    <p className="mt-2 text-xs font-medium text-sage-600">
                      {t("hiddenFromCoach")}
                    </p>
                  ) : null}
                  {row.comment ? (
                    <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm leading-relaxed text-sage-800">
                      {row.comment}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm italic text-sage-500">{t("noComment")}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </StaffListPageLayout>
      {activePending ? (
        <SessionReviewPromptModal
          review={activePending}
          onClosed={() => {
            setActivePending(null);
            void refreshBoth();
          }}
        />
      ) : null}
      {activeSubmitted ? (
        <SessionReviewDetailsModal
          row={activeSubmitted}
          showAnonymousBadge
          onClose={() => setActiveSubmitted(null)}
        />
      ) : null}
    </>
  );
}
