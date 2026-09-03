import type { CSSProperties } from "react";
import { HomeWeeklyScheduleSessionRow } from "@/components/marketing/home/home-weekly-schedule-session-row";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import type { ScheduleSessionEligibility } from "@/lib/schedule-session-eligibility";
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
  closedLabel?: string;
  isClosed?: boolean;
  userBookingId?: string;
  userBookingCreatedAt?: string;
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
  packageEligibility?: ScheduleSessionEligibility;
  eligibilityLoaded?: boolean;
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
  closedLabel,
  isClosed = false,
  userBookingId,
  userBookingCreatedAt,
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
  packageEligibility,
  eligibilityLoaded = true,
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
        closedLabel={closedLabel}
        isClosed={isClosed}
        withInstructorLabel={withInstructorLabel}
        durationLabel={durationLabel}
        spotsLeftLabel={resolvedSpotsLabel}
        audience={audience}
        bookingEnabled={!isClosed}
        showDate={false}
        userBookingId={userBookingId}
        userBookingCreatedAt={userBookingCreatedAt}
        bookingStateReady={bookingStateReady}
        isOnWaitlist={isOnWaitlist}
        loginReturnPath={SCHEDULE_PAGE_LOGIN_RETURN_PATH}
        onBooked={onBooked}
        onCancelled={onCancelled}
        onWaitlisted={onWaitlisted}
        onWaitlistLeft={onWaitlistLeft}
        packageEligibility={packageEligibility}
        eligibilityLoaded={eligibilityLoaded}
        className={className}
        style={style}
      />
    </li>
  );
}
