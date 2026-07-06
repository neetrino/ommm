import type { CSSProperties } from "react";
import { AuthAwareScheduleBookingAction } from "@/components/marketing/auth-aware/auth-aware-schedule-booking-action";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import { getHomeWeeklyScheduleRowGradient } from "@/components/marketing/home/get-home-weekly-schedule-row-gradient";
import { ScheduleSessionSpotsLabel } from "@/components/marketing/schedule/schedule-session-spots-label";
import {
  SCHEDULE_BOOK_BTN,
  SCHEDULE_CLASS_SUBTITLE,
  SCHEDULE_CLASS_TITLE,
  SCHEDULE_DURATION_LABEL,
  SCHEDULE_SESSION_ROW,
  SCHEDULE_TIME_LABEL,
} from "@/components/marketing/schedule/schedule-public-design";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";

export type ScheduleSessionRowProps = {
  row: MarketingScheduleItem;
  bookLabel: string;
  subtitle: string;
  timeLabel: string;
  durationLabel: string;
  spotsFullLabel: string;
  spotsLeftLabel: string;
  audience: PublicPackageCategoryCardsAudience;
  userBookingId?: string;
  bookingStateReady?: boolean;
  spotsStateReady?: boolean;
  spotsLoadingLabel?: string;
  isOnWaitlist?: boolean;
  onBooked?: (sessionId: string, bookingId: string) => void;
  onCancelled?: (sessionId: string) => void;
  onWaitlisted?: (sessionId: string) => void;
  onWaitlistLeft?: (sessionId: string) => void;
  className?: string;
  style?: CSSProperties;
};

export function ScheduleSessionRow({
  row,
  bookLabel,
  subtitle,
  timeLabel,
  durationLabel,
  spotsFullLabel,
  spotsLeftLabel,
  audience,
  userBookingId,
  bookingStateReady = true,
  spotsStateReady = true,
  spotsLoadingLabel,
  isOnWaitlist = false,
  onBooked,
  onCancelled,
  onWaitlisted,
  onWaitlistLeft,
  className,
  style,
}: ScheduleSessionRowProps) {
  const rowBackground = getHomeWeeklyScheduleRowGradient(row.classType, "desktop");

  return (
    <li
      className={`${SCHEDULE_SESSION_ROW} ${className ?? ""}`}
      style={{ ...style, background: rowBackground }}
    >
      <div className="shrink-0">
        <p className={SCHEDULE_TIME_LABEL}>{timeLabel}</p>
        <p className={SCHEDULE_DURATION_LABEL}>{durationLabel}</p>
      </div>
      <div className="min-w-0">
        <p className={SCHEDULE_CLASS_TITLE}>{row.className}</p>
        <p className={SCHEDULE_CLASS_SUBTITLE}>{subtitle}</p>
        <ScheduleSessionSpotsLabel
          availableSpots={row.availableSpots}
          status={row.status}
          fullLabel={spotsFullLabel}
          spotsLeftLabel={spotsLeftLabel}
          spotsReady={spotsStateReady}
          spotsLoadingLabel={spotsLoadingLabel}
        />
      </div>
      <div className="flex items-end justify-end sm:items-center">
        <AuthAwareScheduleBookingAction
          sessionId={row.id}
          sessionDate={row.sessionDate}
          sessionStartTime={row.startTime}
          availableSpots={row.availableSpots}
          sessionStatus={row.status}
          bookLabel={bookLabel}
          audience={audience}
          className={SCHEDULE_BOOK_BTN}
          userBookingId={userBookingId}
          bookingStateReady={bookingStateReady}
          initialOnWaitlist={isOnWaitlist}
          onBooked={(bookingId) => onBooked?.(row.id, bookingId)}
          onCancelled={() => onCancelled?.(row.id)}
          onWaitlisted={() => onWaitlisted?.(row.id)}
          onWaitlistLeft={() => onWaitlistLeft?.(row.id)}
        />
      </div>
    </li>
  );
}
