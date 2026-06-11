import Image from "next/image";
import { AuthAwareScheduleReserveLink } from "@/components/marketing/auth-aware/auth-aware-schedule-reserve-link";
import styles from "@/components/marketing/home/home-weekly-schedule-session-row.module.css";
import { buildMarketingScheduleItemDateTimeRange } from "@/components/marketing/home/build-marketing-schedule-item-datetime-range";
import { formatScheduleTime } from "@/components/marketing/home/format-schedule-time";
import { getHomeWeeklyScheduleRowGradient } from "@/components/marketing/home/get-home-weekly-schedule-row-gradient";
import { SessionDateTimeListDateChip } from "@/components/shared/schedule/session-datetime-list-display";
import {
  HOME_WEEKLY_SCHEDULE_ASSETS,
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
  HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA,
  HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-weekly-schedule-tokens";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { belowFoldImageProps } from "@/lib/image-loading-props";
import { buildSessionDateTimeDisplay } from "@/lib/session-datetime-display";

type HomeWeeklyScheduleSessionRowProps = {
  item: MarketingScheduleItem;
  locale: string;
  reserveLabel: string;
  withInstructorLabel: string;
  durationLabel: string;
  spotsLeftLabel: string;
  bookAriaLabel: string;
};

export function HomeWeeklyScheduleSessionRow({
  item,
  locale,
  reserveLabel,
  withInstructorLabel,
  durationLabel,
  spotsLeftLabel,
  bookAriaLabel,
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
      className={`${marketingMontserrat.className} ${styles.row} group w-full min-w-0`}
      style={{
        background: rowGradientDesktop,
        ["--home-schedule-row-gradient" as string]: rowGradientMobile,
        ["--home-schedule-row-min-h" as string]: `${HOME_WEEKLY_SCHEDULE_FIGMA.sessionRowMinHeightPx}px`,
        ["--home-schedule-row-radius" as string]: HOME_WEEKLY_SCHEDULE_LAYOUT.sessionRowRadius,
        ["--home-schedule-row-radius-mobile" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sessionRowRadius,
        ["--home-schedule-row-padding" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sessionRowPadding,
        ["--home-schedule-reserve-height" as string]: `${HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA.reserveButtonHeightPx}px`,
        ["--home-schedule-reserve-font-size" as string]: `${HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA.reserveButtonFontSizePx / 16}rem`,
        ["--home-schedule-reserve-tracking" as string]: `${HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA.reserveButtonLetterSpacingPx}px`,
      }}
    >
      <div className={styles.info}>
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

        <div className={styles.meta}>
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
        </div>
      </div>

      <AuthAwareScheduleReserveLink
        ariaLabel={bookAriaLabel}
        className={`${styles.reserve} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#695f00]/40 focus-visible:ring-offset-2 active:scale-[0.99]`}
        style={{
          ["--home-schedule-reserve-fill" as string]:
            HOME_WEEKLY_SCHEDULE_FIGMA.reserveButtonFill,
          ["--home-schedule-reserve-hover-fill" as string]:
            HOME_WEEKLY_SCHEDULE_FIGMA.reserveButtonHoverFill,
          ["--home-schedule-reserve-text" as string]:
            HOME_WEEKLY_SCHEDULE_FIGMA.reserveButtonText,
          ["--home-schedule-reserve-border" as string]:
            HOME_WEEKLY_SCHEDULE_FIGMA.reserveButtonBorder,
          ["--home-schedule-reserve-edge" as string]:
            HOME_WEEKLY_SCHEDULE_FIGMA.reserveButtonEdgeHighlight,
          ["--home-schedule-reserve-blur" as string]: `${HOME_WEEKLY_SCHEDULE_FIGMA.reserveButtonBlurPx}px`,
        }}
      >
        {reserveLabel}
      </AuthAwareScheduleReserveLink>
    </article>
  );
}
