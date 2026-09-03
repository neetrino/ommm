"use client";

import type { CSSProperties } from "react";
import { AuthAwareScheduleBookingAction } from "@/components/marketing/auth-aware/auth-aware-schedule-booking-action";
import { getHomeWeeklyScheduleRowGradient } from "@/components/marketing/home/get-home-weekly-schedule-row-gradient";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import {
  SCHEDULE_BOOK_BTN,
  SCHEDULE_BOOKED_BTN_COMPACT,
  SCHEDULE_CANCEL_BTN,
} from "@/components/marketing/schedule/schedule-public-design";
import styles from "@/components/marketing/schedule/schedule-week-session-card.module.css";
import { formatScheduleTimeHHmm } from "@/lib/format-time-display";

const SCHEDULE_PAGE_LOGIN_RETURN_PATH = "/schedule";

type ScheduleWeekSessionCardProps = {
  row: MarketingScheduleItem;
  locale: string;
  bookLabel: string;
  closedLabel: string;
  audience: PublicPackageCategoryCardsAudience;
  isClosed: boolean;
  userBookingId?: string;
  userBookingCreatedAt?: string;
  bookingStateReady?: boolean;
  isOnWaitlist?: boolean;
  onBooked?: (sessionId: string, bookingId: string) => void;
  onCancelled?: (sessionId: string) => void;
  onWaitlisted?: (sessionId: string) => void;
  onWaitlistLeft?: (sessionId: string) => void;
};

function formatTimeRange(locale: string, row: MarketingScheduleItem): string {
  const start = formatScheduleTimeHHmm(locale, row.startTime);
  if (row.endTime === null) {
    return start;
  }
  return `${start} - ${formatScheduleTimeHHmm(locale, row.endTime)}`;
}

/**
 * Compact week-board session card — OMMM row gradients + glass Book control.
 */
export function ScheduleWeekSessionCard({
  row,
  locale,
  bookLabel,
  closedLabel,
  audience,
  isClosed,
  userBookingId,
  userBookingCreatedAt,
  bookingStateReady = true,
  isOnWaitlist = false,
  onBooked,
  onCancelled,
  onWaitlisted,
  onWaitlistLeft,
}: ScheduleWeekSessionCardProps) {
  const level = row.level?.trim() ?? "";
  const classType = row.classType.trim();
  const cardStyle = {
    background: getHomeWeeklyScheduleRowGradient(row.classType, "desktop"),
  } as CSSProperties;

  return (
    <article
      className={[styles.card, isClosed ? styles.cardClosed : ""].filter(Boolean).join(" ")}
      style={cardStyle}
    >
      <div className={styles.body}>
        <h3 className={styles.title}>{row.className}</h3>
        <p className={styles.time}>{formatTimeRange(locale, row)}</p>
        {level.length > 0 ? <span className={styles.level}>{level}</span> : null}
        <p className={styles.coach}>{row.instructorName}</p>
        {classType.length > 0 ? <p className={styles.classType}>{classType}</p> : null}
      </div>
      <div className={styles.footer}>
        {isClosed ? (
          <p className={styles.closedLabel}>{closedLabel}</p>
        ) : (
          <AuthAwareScheduleBookingAction
            sessionId={row.id}
            sessionDate={row.sessionDate}
            sessionStartTime={row.startTime}
            availableSpots={row.availableSpots}
            sessionStatus={row.status}
            bookLabel={bookLabel}
            audience={audience}
            className={`${SCHEDULE_BOOK_BTN} ${styles.bookBtnCompact}`}
            bookedClassName={SCHEDULE_BOOKED_BTN_COMPACT}
            cancelClassName={`${SCHEDULE_CANCEL_BTN} ${styles.bookBtnCompact}`}
            userBookingId={userBookingId}
            userBookingCreatedAt={userBookingCreatedAt}
            bookingStateReady={bookingStateReady}
            initialOnWaitlist={isOnWaitlist}
            loginReturnPath={SCHEDULE_PAGE_LOGIN_RETURN_PATH}
            onBooked={(bookingId) => onBooked?.(row.id, bookingId)}
            onCancelled={() => onCancelled?.(row.id)}
            onWaitlisted={() => onWaitlisted?.(row.id)}
            onWaitlistLeft={() => onWaitlistLeft?.(row.id)}
          />
        )}
      </div>
    </article>
  );
}
