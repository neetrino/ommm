import { AuthAwareScheduleBookingAction } from "@/components/marketing/auth-aware/auth-aware-schedule-booking-action";
import styles from "@/components/marketing/home/home-weekly-schedule-session-row.module.css";
import { buildMarketingScheduleItemDateTimeRange } from "@/components/marketing/home/build-marketing-schedule-item-datetime-range";
import { formatScheduleTime } from "@/components/marketing/home/format-schedule-time";
import { getHomeWeeklyScheduleRowGradient } from "@/components/marketing/home/get-home-weekly-schedule-row-gradient";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import {
  SCHEDULE_BOOK_BTN_HOME,
} from "@/components/marketing/schedule/schedule-public-design";
import { SessionDateTimeListDateChip } from "@/components/shared/schedule/session-datetime-list-display";
import {
  HOME_WEEKLY_SCHEDULE_ASSETS,
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
  HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-weekly-schedule-tokens";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { belowFoldImageProps } from "@/lib/image-loading-props";
import { buildSessionDateTimeDisplay } from "@/lib/session-datetime-display";
import Image from "next/image";

const HOME_BOOKING_LOGIN_RETURN_PATH = "/";

type HomeWeeklyScheduleSessionRowProps = {
  item: MarketingScheduleItem;
  locale: string;
  bookLabel: string;
  withInstructorLabel: string;
  durationLabel: string;
  spotsLeftLabel: string;
  audience: PublicPackageCategoryCardsAudience;
  bookingEnabled: boolean;
  userBookingId?: string;
  bookingStateReady?: boolean;
  isOnWaitlist?: boolean;
  onBooked?: (sessionId: string, bookingId: string) => void;
  onCancelled?: (sessionId: string) => void;
  onWaitlisted?: (sessionId: string) => void;
  onWaitlistLeft?: (sessionId: string) => void;
};

export function HomeWeeklyScheduleSessionRow({
  item,
  locale,
  bookLabel,
  withInstructorLabel,
  durationLabel,
  spotsLeftLabel,
  audience,
  bookingEnabled,
  userBookingId,
  bookingStateReady = true,
  isOnWaitlist = false,
  onBooked,
  onCancelled,
  onWaitlisted,
  onWaitlistLeft,
}: HomeWeeklyScheduleSessionRowProps) {
  const dateTimeRange = buildMarketingScheduleItemDateTimeRange(item);
  const dateTimeDisplay =
    dateTimeRange !== null
      ? buildSessionDateTimeDisplay(
          locale,
          dateTimeRange.startsAt,
          dateTimeRange.endsAt,
        )
      : null;
  const timeLabel =
    dateTimeDisplay?.startTime ?? formatScheduleTime(locale, item.startTime);
  const spotsUrgent = item.availableSpots <= HOME_WEEKLY_SCHEDULE_FIGMA.spotsUrgentThreshold;
  const rowGradientDesktop = getHomeWeeklyScheduleRowGradient(item.classType, "desktop");
  const rowGradientMobile = getHomeWeeklyScheduleRowGradient(item.classType, "mobile");

  return (
    <article
      className={`${styles.row} group w-full min-w-0`}
      style={{
        background: rowGradientDesktop,
        ["--home-schedule-row-gradient" as string]: rowGradientMobile,
        ["--home-schedule-row-min-h" as string]: `${HOME_WEEKLY_SCHEDULE_FIGMA.sessionRowMinHeightPx}px`,
        ["--home-schedule-row-radius" as string]: HOME_WEEKLY_SCHEDULE_LAYOUT.sessionRowRadius,
        ["--home-schedule-row-radius-mobile" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sessionRowRadius,
        ["--home-schedule-row-padding" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sessionRowPadding,
      }}
    >
      <div className={styles.timeCluster}>
        {dateTimeDisplay !== null ? (
          <SessionDateTimeListDateChip display={dateTimeDisplay} />
        ) : null}
        <Image
          src={HOME_WEEKLY_SCHEDULE_ASSETS.clockIcon}
          alt=""
          width={HOME_WEEKLY_SCHEDULE_FIGMA.clockIconSizePx}
          height={HOME_WEEKLY_SCHEDULE_FIGMA.clockIconSizePx}
          unoptimized
          className="shrink-0"
          aria-hidden
          {...belowFoldImageProps()}
        />
        <p
          className={`${styles.time} text-lg font-bold leading-[1.875rem] tracking-[0.03125rem] sm:text-xl`}
          style={{ color: HOME_WEEKLY_SCHEDULE_FIGMA.titleInk }}
        >
          {timeLabel}
        </p>
      </div>

      <div className={styles.classBlock}>
        <p
          className="truncate text-lg font-extrabold leading-[1.875rem] tracking-[0.0375rem] sm:text-xl"
          style={{ color: HOME_WEEKLY_SCHEDULE_FIGMA.titleInk }}
        >
          {item.className}
        </p>
        <p
          className="truncate text-sm font-normal leading-[1.3125rem]"
          style={{ color: HOME_WEEKLY_SCHEDULE_FIGMA.scheduleInk }}
        >
          {withInstructorLabel}
        </p>
      </div>

      <p
        className={`${styles.duration} text-base font-medium leading-[1.875rem] tracking-[0.03125rem] sm:text-xl`}
        style={{ color: HOME_WEEKLY_SCHEDULE_FIGMA.scheduleInk }}
      >
        {durationLabel}
      </p>
      <p
        className={`${styles.spots} text-base font-medium leading-[1.875rem] tracking-[0.03125rem] sm:text-xl`}
        style={{
          color: spotsUrgent
            ? HOME_WEEKLY_SCHEDULE_FIGMA.spotsUrgent
            : HOME_WEEKLY_SCHEDULE_FIGMA.scheduleInk,
        }}
      >
        {spotsLeftLabel}
      </p>

      <div className={styles.bookAction}>
        {bookingEnabled ? (
          <AuthAwareScheduleBookingAction
            sessionId={item.id}
            sessionDate={item.sessionDate}
            sessionStartTime={item.startTime}
            availableSpots={item.availableSpots}
            sessionStatus={item.status}
            bookLabel={bookLabel}
            audience={audience}
            className={SCHEDULE_BOOK_BTN_HOME}
            userBookingId={userBookingId}
            bookingStateReady={bookingStateReady}
            initialOnWaitlist={isOnWaitlist}
            loginReturnPath={HOME_BOOKING_LOGIN_RETURN_PATH}
            onBooked={(bookingId) => onBooked?.(item.id, bookingId)}
            onCancelled={() => onCancelled?.(item.id)}
            onWaitlisted={() => onWaitlisted?.(item.id)}
            onWaitlistLeft={() => onWaitlistLeft?.(item.id)}
          />
        ) : (
          <button
            type="button"
            className={`${SCHEDULE_BOOK_BTN_HOME} cursor-not-allowed opacity-60`}
            disabled
            aria-disabled="true"
          >
            {bookLabel}
          </button>
        )}
      </div>
    </article>
  );
}
