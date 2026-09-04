"use client";

import type { CSSProperties, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import pageStyles from "@/components/marketing/schedule/marketing-schedule-page-section.module.css";
import {
  isBeforeCalendarDay,
  isSameCalendarDay,
  startOfLocalDay,
} from "@/components/marketing/schedule/schedule-date-utils";
import styles from "@/components/marketing/schedule/schedule-week-board.module.css";
import { ScheduleWeekSessionCard } from "@/components/marketing/schedule/schedule-week-session-card";
import { ScheduleWeekPeriodSection } from "@/components/marketing/schedule/schedule-week-period-section";
import { ScheduleWeekRangePicker } from "@/components/marketing/schedule/schedule-week-range-picker";
import {
  buildScheduleWeekColumns,
  formatScheduleWeekRangeLabel,
  groupSessionsByDayAndPeriod,
  resolveVisibleDayPeriods,
  type DayPeriod,
} from "@/components/marketing/schedule/schedule-week-board-helpers";
import { isUpcomingPublicScheduleSession } from "@/lib/filter-public-schedule-items";
import {
  resolveMemberOnWaitlistBadge,
  resolveMemberScheduleRowDisplay,
} from "@/lib/schedule-session-spots";
import {
  sessionBookingCreatedAt,
  sessionBookingId,
  type UserSessionBookingMap,
} from "@/lib/user-session-bookings-map";
import type { ScheduleSessionEligibilityMap } from "@/lib/schedule-session-eligibility";

const SKELETON_CARDS_PER_DAY = 2;

type ScheduleWeekBoardProps = {
  locale: string;
  pageTitle: string;
  windowStart: Date;
  selectedDate: Date;
  sessions: readonly MarketingScheduleItem[];
  sessionsReady: boolean;
  scheduleNow: Date;
  audience: PublicPackageCategoryCardsAudience;
  bookedBySessionId: UserSessionBookingMap;
  waitlistedSessionIds: ReadonlySet<string>;
  memberWaitlistLoaded: boolean;
  memberActionStateReady: boolean;
  eligibilityBySessionId: ScheduleSessionEligibilityMap;
  eligibilityLoaded: boolean;
  minDate: Date;
  maxDate: Date;
  canShiftPrev: boolean;
  canShiftNext: boolean;
  filtersSlot?: ReactNode;
  onSelectDay: (day: Date) => void;
  onShiftWindow: (delta: number) => void;
  onBooked: (sessionId: string, bookingId: string) => void;
  onCancelled: (sessionId: string) => void;
  onWaitlisted: (sessionId: string) => void;
  onWaitlistLeft: (sessionId: string) => void;
};

/**
 * Desktop public schedule — title, week picker, day headers, period rows, cards.
 */
export function ScheduleWeekBoard({
  locale,
  pageTitle,
  windowStart,
  selectedDate,
  sessions,
  sessionsReady,
  scheduleNow,
  audience,
  bookedBySessionId,
  waitlistedSessionIds,
  memberWaitlistLoaded,
  memberActionStateReady,
  eligibilityBySessionId,
  eligibilityLoaded,
  minDate,
  maxDate,
  canShiftPrev,
  canShiftNext,
  filtersSlot,
  onSelectDay,
  onShiftWindow,
  onBooked,
  onCancelled,
  onWaitlisted,
  onWaitlistLeft,
}: ScheduleWeekBoardProps) {
  const t = useTranslations("marketingPages.schedule");
  const today = startOfLocalDay(scheduleNow);
  const [collapsedPeriods, setCollapsedPeriods] = useState<ReadonlySet<DayPeriod>>(
    () => new Set(),
  );

  const columns = useMemo(() => buildScheduleWeekColumns(windowStart), [windowStart]);
  const weekRangeLabel = formatScheduleWeekRangeLabel(locale, windowStart);
  const sessionsByDayAndPeriod = useMemo(
    () => groupSessionsByDayAndPeriod(sessions),
    [sessions],
  );
  const visiblePeriods = useMemo(
    () => resolveVisibleDayPeriods(columns, sessionsByDayAndPeriod),
    [columns, sessionsByDayAndPeriod],
  );

  function togglePeriod(period: DayPeriod) {
    setCollapsedPeriods((current) => {
      const next = new Set(current);
      if (next.has(period)) {
        next.delete(period);
      } else {
        next.add(period);
      }
      return next;
    });
  }

  function renderSessionCard(row: MarketingScheduleItem, isPastDay: boolean) {
    const isClosed =
      !isUpcomingPublicScheduleSession(row, scheduleNow) || isPastDay;
    const userOnWaitlist =
      bookedBySessionId[row.id] === undefined && waitlistedSessionIds.has(row.id);
    const displayRow = resolveMemberScheduleRowDisplay({
      row,
      onWaitlist: userOnWaitlist,
      capacityReady: memberWaitlistLoaded,
    });
    const showOnWaitlist = resolveMemberOnWaitlistBadge({
      userBookingId: sessionBookingId(bookedBySessionId, row.id),
      onWaitlist: userOnWaitlist,
      availableSpots: displayRow.availableSpots,
      sessionStatus: displayRow.status,
      capacityReady: memberWaitlistLoaded,
    });

    return (
      <ScheduleWeekSessionCard
        row={displayRow}
        locale={locale}
        bookLabel={t("bookCta")}
        closedLabel={t("sessionClosed")}
        audience={audience}
        isClosed={isClosed}
        userBookingId={sessionBookingId(bookedBySessionId, row.id)}
        userBookingCreatedAt={sessionBookingCreatedAt(bookedBySessionId, row.id)}
        bookingStateReady={memberActionStateReady}
        isOnWaitlist={showOnWaitlist}
        packageEligibility={eligibilityBySessionId.get(row.id)}
        eligibilityLoaded={eligibilityLoaded}
        onBooked={onBooked}
        onCancelled={onCancelled}
        onWaitlisted={onWaitlisted}
        onWaitlistLeft={onWaitlistLeft}
      />
    );
  }

  return (
    <div className={styles.board} aria-label={t("weekBoardAria")}>
      <div className={styles.chrome}>
        <header className={pageStyles.hero}>
          <h1 className={pageStyles.title}>{pageTitle}</h1>
        </header>

        <ScheduleWeekRangePicker
          locale={locale}
          weekRangeLabel={weekRangeLabel}
          selectedDate={selectedDate}
          minDate={minDate}
          maxDate={maxDate}
          canShiftPrev={canShiftPrev}
          canShiftNext={canShiftNext}
          filtersSlot={filtersSlot}
          onSelectDay={onSelectDay}
          onShiftWindow={onShiftWindow}
        />

        <div className={styles.dayHeaders}>
          {columns.map((column) => {
            const isToday = isSameCalendarDay(column.day, today);
            const isSelected = isSameCalendarDay(column.day, selectedDate);
            const isPastDay = isBeforeCalendarDay(column.day, today);
            const weekday = new Intl.DateTimeFormat(locale, {
              weekday: "long",
            }).format(column.day);

            return (
              <button
                key={column.dayKey}
                type="button"
                className={[
                  styles.dayHeader,
                  isSelected ? "" : styles.dayHeaderDimmed,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onSelectDay(column.day)}
                aria-pressed={isSelected}
              >
                <span
                  className={[
                    styles.weekday,
                    isToday || isSelected ? styles.weekdayActive : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {weekday}
                </span>
                <span
                  className={[
                    styles.dayNumber,
                    isPastDay ? styles.dayNumberPast : "",
                    isToday || isSelected ? styles.dayNumberSelected : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {column.day.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {!sessionsReady ? (
        <div
          className={styles.periodTrack}
          style={
            {
              "--period-session-rows": SKELETON_CARDS_PER_DAY,
            } as CSSProperties
          }
          aria-hidden
        >
          {columns.map((column) => {
            const isSelected = isSameCalendarDay(column.day, selectedDate);
            return (
              <div
                key={column.dayKey}
                className={[
                  styles.column,
                  isSelected ? "" : styles.columnDimmed,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {Array.from({ length: SKELETON_CARDS_PER_DAY }, (_, idx) => (
                  <div key={idx} className={styles.skeletonCard} />
                ))}
              </div>
            );
          })}
        </div>
      ) : visiblePeriods.length === 0 ? (
        <p className={styles.emptyDay}>{t("emptyDay")}</p>
      ) : (
        visiblePeriods.map((period) => (
          <ScheduleWeekPeriodSection
            key={period}
            period={period}
            collapsed={collapsedPeriods.has(period)}
            columns={columns}
            today={today}
            selectedDate={selectedDate}
            sessionsByDayAndPeriod={sessionsByDayAndPeriod}
            onToggle={() => togglePeriod(period)}
            renderSessionCard={renderSessionCard}
          />
        ))
      )}
    </div>
  );
}
