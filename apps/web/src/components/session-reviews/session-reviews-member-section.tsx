"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SessionReviewPromptModal } from "@/components/account/session-review-prompt-modal";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { OmmButton } from "@/components/ui/omm-button";
import { useSessionReviewsPending } from "@/hooks/use-session-reviews-pending";
import { formatSessionReviewWhen } from "@/lib/format-session-review-when";
import type { MemberPendingReview } from "@/lib/session-reviews-types";

export function SessionReviewsMemberSection() {
  const locale = useLocale();
  const t = useTranslations("sessionReviewsPages");
  const { items, loading, error, refetch } = useSessionReviewsPending(true);
  const [activeReview, setActiveReview] = useState<MemberPendingReview | null>(null);

  return (
    <>
      <StaffListPageLayout title={t("memberTitle")}>
        {loading ? <p className="text-sm text-sage-600">{t("loading")}</p> : null}
        {error ? <p className="text-sm text-amber-900">{t("loadFailed")}</p> : null}
        {!loading && !error && items.length === 0 ? (
          <p className="rounded-2xl border border-sand-200/80 bg-white/80 px-5 py-10 text-center text-sm text-sage-600">
            {t("memberEmpty")}
          </p>
        ) : null}
        <div className="space-y-3">
          {items.map((row) => (
            <article
              key={row.id}
              className="rounded-2xl border border-sand-200/80 bg-white/90 p-5 shadow-[0_12px_28px_-22px_rgba(45,40,35,0.2)]"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-sage-500">
                {formatSessionReviewWhen(locale, row.startsAt, row.endsAt)}
              </p>
              <h2 className="mt-1 font-serif text-xl text-sage-900">{row.classTypeName}</h2>
              {row.coachName ? (
                <p className="mt-1 text-sm text-sage-600">{row.coachName}</p>
              ) : null}
              <OmmButton
                type="button"
                size="sm"
                variant="primary"
                className="mt-3"
                onClick={() => setActiveReview(row)}
              >
                {t("writeReview")}
              </OmmButton>
            </article>
          ))}
        </div>
      </StaffListPageLayout>
      {activeReview ? (
        <SessionReviewPromptModal
          review={activeReview}
          onClosed={() => {
            setActiveReview(null);
            void refetch();
          }}
        />
      ) : null}
    </>
  );
}
