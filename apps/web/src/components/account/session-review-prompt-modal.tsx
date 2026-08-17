"use client";

import { useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SessionReviewPromptForm } from "@/components/account/session-review-prompt-form";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { formatSessionReviewWhen } from "@/lib/format-session-review-when";
import { markSessionReviewLater } from "@/lib/session-review-later-storage";
import type { MemberPendingReview } from "@/lib/session-reviews-types";
import styles from "@/components/account/required-phone-completion-gate.module.css";

type SessionReviewPromptModalProps = {
  review: MemberPendingReview;
  onClosed: () => void;
};

export function SessionReviewPromptModal({
  review,
  onClosed,
}: SessionReviewPromptModalProps) {
  const locale = useLocale();
  const t = useTranslations("sessionReviewPrompt");
  const titleId = useId();
  const descId = useId();
  const whenLabel = formatSessionReviewWhen(locale, review.startsAt, review.endsAt);
  const classLabel = review.sessionTitle.trim() || review.classTypeName;

  function later() {
    markSessionReviewLater(review.id);
    onClosed();
  }

  return (
    <OmmModalPortal
      isOpen
      onClose={later}
      dialogRole="dialog"
      ariaLabelledBy={titleId}
      ariaDescribedBy={descId}
      backdropAriaLabel={t("backdropAria")}
      centered
      overlayClassName={`${styles.overlay} ommm-modal-overlay z-[115] items-center p-4`}
      panelClassName={`${styles.panel} max-h-[min(90vh,40rem)] overflow-y-auto`}
    >
      <div className={styles.form}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h2 id={titleId} className={styles.title}>
          {classLabel}
        </h2>
        <p id={descId} className={styles.body}>
          {whenLabel}
          {review.coachName ? ` · ${review.coachName}` : ""}
        </p>
        <SessionReviewPromptForm reviewId={review.id} onClosed={onClosed} onLater={later} />
      </div>
    </OmmModalPortal>
  );
}
