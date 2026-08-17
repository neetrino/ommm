"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatSessionReviewWhen } from "@/lib/format-session-review-when";
import type { CoachInboxReview, StaffInboxReview } from "@/lib/session-reviews-types";

export function SessionReviewInboxCard({
  row,
  showAnonymousBadge,
  onOpen,
}: {
  row: StaffInboxReview | CoachInboxReview;
  showAnonymousBadge: boolean;
  onOpen: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("sessionReviewsPages");
  const anonymous = "isAnonymous" in row ? row.isAnonymous : false;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl border border-sand-200/80 bg-white/90 p-5 text-left shadow-[0_12px_28px_-22px_rgba(45,40,35,0.2)] transition-[border-color,box-shadow,transform] hover:border-sand-300 hover:shadow-[0_16px_32px_-20px_rgba(45,40,35,0.28)] active:scale-[0.995]"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-sage-500">
        {formatSessionReviewWhen(locale, row.startsAt, row.endsAt)}
      </p>
      <h2 className="mt-1 font-serif text-xl text-sage-900">{row.classTypeName}</h2>
      <p className="mt-2 text-sm text-sage-700">
        {t("ratingLabel", { rating: row.rating })} · {row.author.displayName}
        {showAnonymousBadge && anonymous ? ` · ${t("hiddenFromCoach")}` : ""}
      </p>
      {row.comment ? (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-sage-800">{row.comment}</p>
      ) : (
        <p className="mt-3 text-sm italic text-sage-500">{t("noComment")}</p>
      )}
    </button>
  );
}
