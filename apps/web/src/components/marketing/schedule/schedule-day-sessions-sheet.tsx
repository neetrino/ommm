"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useId } from "react";
import { useTranslations } from "next-intl";
import styles from "@/components/marketing/schedule/schedule-day-sessions-sheet.module.css";
import { useScheduleCalendarSheetMotion } from "@/components/marketing/schedule/use-schedule-calendar-sheet-motion";
import { useCloseOnEscape } from "@/hooks/use-close-on-escape";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

export type ScheduleDaySessionsSheetCopy = {
  aria: string;
  closeAria: string;
  eyebrow: string;
};

type ScheduleDaySessionsSheetProps = {
  open: boolean;
  dayLabel: string;
  children: ReactNode;
  onClose: () => void;
  copy?: ScheduleDaySessionsSheetCopy;
};

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <path
        d="M3 3l8 8M11 3L3 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Side sheet (bottom on narrow) with the selected day’s class list. */
export function ScheduleDaySessionsSheet({
  open,
  dayLabel,
  children,
  onClose,
  copy,
}: ScheduleDaySessionsSheetProps) {
  const t = useTranslations("marketingPages.schedule");
  const titleId = useId();
  const clientMounted = useIsClientMounted();
  const sheetCopy = copy ?? {
    aria: t("daySessionsSheetAria"),
    closeAria: t("daySessionsSheetCloseAria"),
    eyebrow: t("daySessionsSheetEyebrow"),
  };
  const { presented, motionOpen, requestClose } = useScheduleCalendarSheetMotion(
    open,
    onClose,
  );

  useLockBodyScroll(presented);
  useCloseOnEscape(presented, requestClose);

  if (!presented || !clientMounted) {
    return null;
  }

  const backdropClass = [
    styles.backdrop,
    motionOpen ? styles.backdropOpen : styles.backdropClosing,
  ].join(" ");
  const panelClass = [
    styles.panel,
    motionOpen ? styles.panelOpen : styles.panelClosing,
  ].join(" ");

  return createPortal(
    <div className={styles.overlay} role="presentation">
      <button
        type="button"
        className={backdropClass}
        aria-label={sheetCopy.closeAria}
        onClick={requestClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={sheetCopy.aria}
        className={panelClass}
      >
        <div className={styles.header}>
          <div className={styles.titleBlock}>
            <p className={styles.eyebrow}>{sheetCopy.eyebrow}</p>
            <h2 id={titleId} className={styles.title}>
              {dayLabel}
            </h2>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label={sheetCopy.closeAria}
            onClick={requestClose}
          >
            <CloseIcon />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
