"use client";

import { useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SessionReviewRatingStars } from "@/components/session-reviews/session-review-rating-stars";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { formatSessionReviewWhen } from "@/lib/format-session-review-when";
import type { CoachInboxReview, StaffInboxReview } from "@/lib/session-reviews-types";
import styles from "@/components/account/required-phone-completion-gate.module.css";

type SessionReviewDetailsModalProps = {
  row: StaffInboxReview | CoachInboxReview;
  showAnonymousBadge: boolean;
  onClose: () => void;
};

export function SessionReviewDetailsModal({
  row,
  showAnonymousBadge,
  onClose,
}: SessionReviewDetailsModalProps) {
  const locale = useLocale();
  const t = useTranslations("sessionReviewsPages");
  const titleId = useId();
  const descId = useId();
  const anonymous = "isAnonymous" in row ? row.isAnonymous : false;
  const whenLabel = formatSessionReviewWhen(locale, row.startsAt, row.endsAt);
  const coachName = "coachName" in row ? row.coachName : "";

  return (
    <OmmModalPortal
      isOpen
      onClose={onClose}
      dialogRole="dialog"
      ariaLabelledBy={titleId}
      ariaDescribedBy={descId}
      backdropAriaLabel={t("detailsCloseBackdrop")}
      centered
      overlayClassName={`${styles.overlay} ommm-modal-overlay z-[115] items-center p-4`}
      panelClassName={`${styles.panel} max-h-[min(90vh,40rem)] overflow-y-auto`}
    >
      <div className={styles.form}>
        <p className={styles.eyebrow}>{t("detailsEyebrow")}</p>
        <h2 id={titleId} className={styles.title}>
          {row.classTypeName}
        </h2>
        <p id={descId} className={styles.body}>
          {whenLabel}
          {coachName ? ` · ${coachName}` : ""}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <SessionReviewRatingStars
            rating={row.rating}
            label={t("ratingLabel", { rating: row.rating })}
            sizeClassName="text-xl"
          />
          <p className="text-sm font-medium text-sage-800">{row.author.displayName}</p>
        </div>
        {showAnonymousBadge && anonymous ? (
          <p className="rounded-full bg-sand-100/90 px-3 py-1 text-xs font-medium text-sage-700 w-fit">
            {t("hiddenFromCoach")}
          </p>
        ) : null}
        <div className="rounded-2xl border border-sand-200/80 bg-white/75 px-4 py-3">
          {row.comment ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-sage-800">{row.comment}</p>
          ) : (
            <p className="text-sm italic text-sage-500">{t("noComment")}</p>
          )}
        </div>
        <OmmButton type="button" variant="secondary" size="md" className="w-full" onClick={onClose}>
          {t("detailsClose")}
        </OmmButton>
      </div>
    </OmmModalPortal>
  );
}
