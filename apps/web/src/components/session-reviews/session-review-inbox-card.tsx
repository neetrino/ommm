"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatSessionReviewWhen } from "@/lib/format-session-review-when";
import type { CoachInboxReview, StaffInboxReview } from "@/lib/session-reviews-types";

export function SessionReviewInboxCard({
  row,
  showAnonymousBadge,
}: {
  row: StaffInboxReview | CoachInboxReview;
  showAnonymousBadge: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("sessionReviewsPages");
  const anonymous = "isAnonymous" in row ? row.isAnonymous : false;
  return (
    <article className="rounded-2xl border border-sand-200/80 bg-white/90 p-5 shadow-[0_12px_28px_-22px_rgba(45,40,35,0.2)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-sage-500">
        {formatSessionReviewWhen(locale, row.startsAt, row.endsAt)}
      </p>
      <h2 className="mt-1 font-serif text-xl text-sage-900">{row.classTypeName}</h2>
      <p className="mt-2 text-sm text-sage-700">
        {t("ratingLabel", { rating: row.rating })} · {row.author.displayName}
        {showAnonymousBadge && anonymous ? ` · ${t("hiddenFromCoach")}` : ""}
      </p>
      {row.comment ? (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-sage-800">{row.comment}</p>
      ) : (
        <p className="mt-3 text-sm italic text-sage-500">{t("noComment")}</p>
      )}
    </article>
  );
}
