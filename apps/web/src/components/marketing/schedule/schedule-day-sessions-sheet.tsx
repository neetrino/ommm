"use client";

import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useId, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_MOBILE_SHEET_GRABBER_CLASS,
} from "@/components/admin/admin-mobile-sheet-layout";
import { useAdminMobileSheetDragClose } from "@/components/admin/use-admin-mobile-sheet-drag-close";
import styles from "@/components/marketing/schedule/schedule-day-sessions-sheet.module.css";
import { useScheduleCalendarSheetMotion } from "@/components/marketing/schedule/use-schedule-calendar-sheet-motion";
import { useCloseOnEscape } from "@/hooks/use-close-on-escape";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

/** Matches `.panel` bottom-sheet layout in the CSS module. */
const SCHEDULE_DAY_SHEET_PHONE_MEDIA_QUERY = "(max-width: 639px)";

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

function subscribeScheduleDaySheetPhone(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(SCHEDULE_DAY_SHEET_PHONE_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function readScheduleDaySheetPhone(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia(SCHEDULE_DAY_SHEET_PHONE_MEDIA_QUERY).matches;
}

/** Phone viewport where the day sheet is a bottom sheet (not a side drawer). */
function useScheduleDaySheetPhone(): boolean {
  return useSyncExternalStore(
    subscribeScheduleDaySheetPhone,
    readScheduleDaySheetPhone,
    () => false,
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
  const isPhoneSheet = useScheduleDaySheetPhone();
  const sheetCopy = copy ?? {
    aria: t("daySessionsSheetAria"),
    closeAria: t("daySessionsSheetCloseAria"),
    eyebrow: t("daySessionsSheetEyebrow"),
  };
  const { presented, motionOpen, requestClose } = useScheduleCalendarSheetMotion(
    open,
    onClose,
  );
  const dragCloseEnabled = isPhoneSheet && presented && motionOpen;
  const { dragOffsetPx, isDragging, grabberHandlers } = useAdminMobileSheetDragClose(
    dragCloseEnabled,
    requestClose,
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
    isDragging ? styles.panelDragging : "",
  ]
    .filter(Boolean)
    .join(" ");
  const dragging = isDragging || dragOffsetPx > 0;
  const panelStyle: CSSProperties | undefined = dragging
    ? { transform: `translate3d(0, ${dragOffsetPx}px, 0)` }
    : undefined;

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
        style={panelStyle}
      >
        {isPhoneSheet ? (
          <div
            role="button"
            tabIndex={0}
            aria-label={sheetCopy.closeAria}
            className={styles.grabberRow}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                requestClose();
              }
            }}
            {...grabberHandlers}
          >
            <div className={`${ADMIN_MOBILE_SHEET_GRABBER_CLASS} ${styles.grabber}`} />
          </div>
        ) : null}
        <div className={styles.header}>
          <div className={styles.titleBlock}>
            <p className={styles.eyebrow}>{sheetCopy.eyebrow}</p>
            <h2 id={titleId} className={styles.title}>
              {dayLabel}
            </h2>
          </div>
          {isPhoneSheet ? null : (
            <button
              type="button"
              className={styles.closeBtn}
              aria-label={sheetCopy.closeAria}
              onClick={requestClose}
            >
              <CloseIcon />
            </button>
          )}
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
