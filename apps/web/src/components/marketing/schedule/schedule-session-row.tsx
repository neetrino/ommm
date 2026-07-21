import type { CSSProperties } from "react";
import { HomeWeeklyScheduleSessionRow } from "@/components/marketing/home/home-weekly-schedule-session-row";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { isScheduleSessionFull } from "@/lib/schedule-session-spots";

const SCHEDULE_PAGE_LOGIN_RETURN_PATH = "/schedule";

export type ScheduleSessionRowProps = {
  row: MarketingScheduleItem;
  locale: string;
  bookLabel: string;
  withInstructorLabel: string;
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

/** Schedule page session card — same layout as home weekly schedule, without the date chip. */
export function ScheduleSessionRow({
  row,
  locale,
  bookLabel,
  withInstructorLabel,
  durationLabel,
  spotsFullLabel,
  spotsLeftLabel,
  audience,
  userBookingId,
  bookingStateReady = true,
  spotsStateReady = true,
  spotsLoadingLabel = "…",
  isOnWaitlist = false,
  onBooked,
  onCancelled,
  onWaitlisted,
  onWaitlistLeft,
  className,
  style,
}: ScheduleSessionRowProps) {
  const resolvedSpotsLabel = !spotsStateReady
    ? spotsLoadingLabel
    : isScheduleSessionFull(row.availableSpots, row.status)
      ? spotsFullLabel
      : spotsLeftLabel;

  return (
    <li className="list-none">
      <HomeWeeklyScheduleSessionRow
        item={row}
        locale={locale}
        bookLabel={bookLabel}
        withInstructorLabel={withInstructorLabel}
        durationLabel={durationLabel}
        spotsLeftLabel={resolvedSpotsLabel}
        audience={audience}
        bookingEnabled
        showDate={false}
        userBookingId={userBookingId}
        bookingStateReady={bookingStateReady}
        isOnWaitlist={isOnWaitlist}
        loginReturnPath={SCHEDULE_PAGE_LOGIN_RETURN_PATH}
        onBooked={onBooked}
        onCancelled={onCancelled}
        onWaitlisted={onWaitlisted}
        onWaitlistLeft={onWaitlistLeft}
        className={className}
        style={style}
      />
    </li>
  );
}
