"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/components/marketing/home/home-weekly-schedule-compact-view.module.css";
import { HomeWeeklyScheduleSessionRow } from "@/components/marketing/home/home-weekly-schedule-session-row";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import transitionStyles from "@/components/marketing/schedule/marketing-schedule-view.module.css";
import { useScheduleDayTransition } from "@/components/marketing/schedule/use-schedule-day-transition";
import {
  HOME_WEEKLY_SCHEDULE_DAY_CHIP_CLASS,
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
  HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA,
  HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-weekly-schedule-tokens";
import type { MarketingScheduleDayOfWeek } from "@/components/marketing/schedule/marketing-schedule-types";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { Link } from "@/i18n/navigation";
import { buildPublicScheduleHrefForDate } from "@/components/marketing/schedule/marketing-schedule-nav.helpers";
import { SCHEDULE_BOOK_BTN_HOME } from "@/components/marketing/schedule/schedule-public-design";
import {
  resolveMemberOnWaitlistBadge,
  resolveMemberScheduleRowDisplay,
} from "@/lib/schedule-session-spots";
import {
  sessionBookingCreatedAt,
  sessionBookingId,
  type UserSessionBookingMap,
} from "@/lib/user-session-bookings-map";

const HOME_WEEKLY_SCHEDULE_MAX_VISIBLE_SESSIONS =
  HOME_WEEKLY_SCHEDULE_FIGMA.maxVisibleSessionsPerDay;

export type HomeWeeklyScheduleCompactDay = {
  day: MarketingScheduleDayOfWeek;
  /** Studio calendar date (`YYYY-MM-DD`) for this tab in the focused week. */
  calendarDate: string;
  label: string;
  emptyLabel: string;
  sessions: readonly {
    id: string;
    item: MarketingScheduleItem;
    bookAriaLabel: string;
    withInstructorLabel: string;
    durationLabel: string;
    spotsLeftLabel: string;
  }[];
};

type HomeWeeklyScheduleDayViewProps = {
  locale: string;
  days: readonly HomeWeeklyScheduleCompactDay[];
  initialDay: MarketingScheduleDayOfWeek;
  audience: PublicPackageCategoryCardsAudience;
  bookLabel: string;
  bookingEnabled: boolean;
  bookedBySessionId: UserSessionBookingMap;
  memberActionStateReady: boolean;
  memberWaitlistLoaded: boolean;
  waitlistedSessionIds: ReadonlySet<string>;
  onBooked: (sessionId: string, bookingId: string) => void;
  onCancelled: (sessionId: string) => void;
  onWaitlisted: (sessionId: string) => void;
  onWaitlistLeft: (sessionId: string) => void;
};

export function HomeWeeklyScheduleDayView({
  locale,
  days,
  initialDay,
  audience,
  bookLabel,
  bookingEnabled,
  bookedBySessionId,
  memberActionStateReady,
  memberWaitlistLoaded,
  waitlistedSessionIds,
  onBooked,
  onCancelled,
  onWaitlisted,
  onWaitlistLeft,
}: HomeWeeklyScheduleDayViewProps) {
  const t = useTranslations("marketingPublic.home");
  const [selectedDay, setSelectedDay] = useState<MarketingScheduleDayOfWeek>(initialDay);
  const userPickedDayRef = useRef(false);

  useEffect(() => {
    if (userPickedDayRef.current) {
      return;
    }
    setSelectedDay(initialDay);
  }, [initialDay]);

  const activeDay =
    days.find((entry) => entry.day === selectedDay) ?? days[0] ?? null;

  const visibleSessions = useMemo(
    () => (activeDay?.sessions ?? []).slice(0, HOME_WEEKLY_SCHEDULE_MAX_VISIBLE_SESSIONS),
    [activeDay],
  );

  const {
    contentRef,
    renderedDayKey,
    renderedSessions,
    animationPhase,
    containerStyle,
    getItemStyle,
  } = useScheduleDayTransition({
    selectedDayKey: selectedDay,
    visibleSessions,
  });

  const renderedDay = useMemo(
    () => days.find((entry) => entry.day === renderedDayKey) ?? days[0] ?? null,
    [days, renderedDayKey],
  );
  const showSeeFullSchedule =
    (renderedDay?.sessions.length ?? 0) > HOME_WEEKLY_SCHEDULE_MAX_VISIBLE_SESSIONS;

  const selectDay = useCallback((day: MarketingScheduleDayOfWeek) => {
    userPickedDayRef.current = true;
    setSelectedDay(day);
  }, []);

  if (activeDay === null) {
    return null;
  }

  return (
    <div
      className={`font-sans ${styles.root}`}
      style={{
        ["--home-schedule-panel-gap" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.panelGap,
        ["--home-schedule-day-tabs-section-padding-top" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.dayTabsSectionPaddingTop,
        ["--home-schedule-day-tab-gap" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.dayTabGap,
        ["--home-schedule-day-tab-gap-lg" as string]: HOME_WEEKLY_SCHEDULE_LAYOUT.dayTabGap,
        ["--home-schedule-day-tab-list-height" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.dayTabListHeight,
        ["--home-schedule-day-tab-list-padding-bottom" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.dayTabListPaddingBottom,
        ["--home-schedule-day-tab-strip-min-width" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.dayTabStripMinWidth,
        ["--home-schedule-day-tab-height" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.dayTabHeight,
        ["--home-schedule-day-tab-font-size" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.dayTabFontSize,
        ["--home-schedule-day-chip-border-width" as string]: `${HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA.dayChipBorderWidthPx}px`,
        ["--home-schedule-day-chip-border-width-lg" as string]: `${HOME_WEEKLY_SCHEDULE_FIGMA.dayChipBorderWidthPx}px`,
        ["--home-schedule-session-list-gap" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sessionListGap,
        ["--home-schedule-session-list-gap-lg" as string]:
          HOME_WEEKLY_SCHEDULE_LAYOUT.sessionListGap,
        ["--home-schedule-session-row-duration-spots-gap" as string]:
          HOME_WEEKLY_SCHEDULE_LAYOUT.sessionRowDurationSpotsGap,
        ["--home-schedule-session-row-spots-button-gap" as string]:
          HOME_WEEKLY_SCHEDULE_LAYOUT.sessionRowSpotsButtonGap,
        ["--home-schedule-session-row-duration-col-width" as string]:
          HOME_WEEKLY_SCHEDULE_LAYOUT.sessionRowDurationColumnWidth,
        ["--home-schedule-session-row-spots-col-width" as string]:
          HOME_WEEKLY_SCHEDULE_LAYOUT.sessionRowSpotsColumnWidth,
        ["--home-schedule-session-row-time-col-width" as string]:
          HOME_WEEKLY_SCHEDULE_LAYOUT.sessionRowTimeColumnWidth,
        ["--home-schedule-session-row-radius" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sessionRowRadius,
        ["--home-schedule-session-row-radius-lg" as string]:
          HOME_WEEKLY_SCHEDULE_LAYOUT.sessionRowRadius,
        ["--home-schedule-day-chip-idle-border" as string]:
          HOME_WEEKLY_SCHEDULE_FIGMA.dayChipIdleBorder,
        ["--home-schedule-schedule-ink" as string]: HOME_WEEKLY_SCHEDULE_FIGMA.scheduleInk,
        ["--home-schedule-title-ink" as string]: HOME_WEEKLY_SCHEDULE_FIGMA.titleInk,
      }}
    >
      <div className={styles.dayTabsSection}>
        <div
          role="tablist"
          aria-label={t("weeklyScheduleDayTabsAria")}
          className={styles.dayTabList}
        >
          <div className={styles.dayTabTrack}>
            {days.map((entry) => {
              const isSelected = entry.day === selectedDay;
              const sessionCount = entry.sessions.length;
              return (
                <button
                  key={entry.day}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`home-weekly-schedule-panel-${entry.day}`}
                  id={`home-weekly-schedule-tab-${entry.day}`}
                  onClick={() => selectDay(entry.day)}
                  className={`${HOME_WEEKLY_SCHEDULE_DAY_CHIP_CLASS} ${styles.dayTab} ${
                    isSelected ? "font-extrabold" : "bg-transparent font-semibold"
                  }`}
                  style={{
                    borderWidth: isSelected ? 0 : undefined,
                    borderStyle: "solid",
                    borderColor: HOME_WEEKLY_SCHEDULE_FIGMA.dayChipIdleBorder,
                    color: isSelected
                      ? HOME_WEEKLY_SCHEDULE_FIGMA.dayChipActiveText
                      : HOME_WEEKLY_SCHEDULE_FIGMA.dayChipIdleText,
                    backgroundColor: isSelected
                      ? HOME_WEEKLY_SCHEDULE_FIGMA.dayChipActiveFill
                      : "transparent",
                  }}
                  aria-label={t("weeklyScheduleDayTabAria", {
                    day: entry.label,
                    count: sessionCount,
                  })}
                >
                  {entry.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        id={`home-weekly-schedule-panel-${activeDay.day}`}
        role="tabpanel"
        aria-labelledby={`home-weekly-schedule-tab-${activeDay.day}`}
        aria-label={t("weeklyScheduleSessionsPanelAria", { day: activeDay.label })}
        className={styles.sessionPanel}
      >
        <div className={styles.sessionPanelViewport} style={containerStyle}>
          <div
            ref={contentRef}
            className={
              animationPhase === "exit"
                ? transitionStyles.scheduleListExit
                : animationPhase === "enter"
                  ? transitionStyles.scheduleListEnter
                  : undefined
            }
          >
            {renderedDay === null ? null : (
              <div key={renderedDayKey} className={styles.sessionList}>
                {renderedSessions.length === 0 ? (
                  <div
                    className={`${styles.emptyDay} ${
                      animationPhase === "enter" ? transitionStyles.scheduleItemEnter : ""
                    }`}
                  >
                    {renderedDay.emptyLabel}
                  </div>
                ) : (
                  <>
                    {renderedSessions.map((session, index) => {
                      const userOnWaitlist =
                        bookedBySessionId[session.item.id] === undefined &&
                        waitlistedSessionIds.has(session.item.id);
                      const displayRow = resolveMemberScheduleRowDisplay({
                        row: session.item,
                        onWaitlist: userOnWaitlist,
                        capacityReady: memberWaitlistLoaded,
                      });
                      const showOnWaitlist = resolveMemberOnWaitlistBadge({
                        userBookingId: sessionBookingId(bookedBySessionId, session.item.id),
                        onWaitlist: userOnWaitlist,
                        availableSpots: displayRow.availableSpots,
                        sessionStatus: displayRow.status,
                        capacityReady: memberWaitlistLoaded,
                      });
                      const spotsLeftLabel = t("weeklyScheduleSpotsLeft", {
                        count: displayRow.availableSpots,
                      });

                      return (
                        <div
                          key={session.id}
                          className={`${styles.sessionListItem} ${
                            animationPhase === "enter" ? transitionStyles.scheduleItemEnter : ""
                          }`.trim()}
                          style={getItemStyle(index)}
                        >
                          <HomeWeeklyScheduleSessionRow
                            item={displayRow}
                            locale={locale}
                            bookLabel={bookLabel}
                            withInstructorLabel={session.withInstructorLabel}
                            durationLabel={session.durationLabel}
                            spotsLeftLabel={spotsLeftLabel}
                            audience={audience}
                            bookingEnabled={bookingEnabled}
                            userBookingId={sessionBookingId(bookedBySessionId, session.item.id)}
                            userBookingCreatedAt={sessionBookingCreatedAt(
                              bookedBySessionId,
                              session.item.id,
                            )}
                            bookingStateReady={memberActionStateReady}
                            isOnWaitlist={showOnWaitlist}
                            onBooked={onBooked}
                            onCancelled={onCancelled}
                            onWaitlisted={onWaitlisted}
                            onWaitlistLeft={onWaitlistLeft}
                          />
                        </div>
                      );
                    })}
                    {showSeeFullSchedule && renderedDay !== null ? (
                      <div
                        className={`${styles.seeFullWrap} ${
                          animationPhase === "enter" ? transitionStyles.scheduleItemEnter : ""
                        }`}
                        style={getItemStyle(renderedSessions.length)}
                      >
                        <div className={styles.seeFullSlot}>
                          <Link
                            href={buildPublicScheduleHrefForDate(renderedDay.calendarDate)}
                            className={`${SCHEDULE_BOOK_BTN_HOME} ${styles.seeFullLink}`}
                          >
                            {t("weeklyScheduleSeeFull")}
                          </Link>
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
