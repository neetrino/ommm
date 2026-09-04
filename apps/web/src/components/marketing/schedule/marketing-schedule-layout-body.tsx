"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import { ScheduleDaySessionsList } from "@/components/marketing/schedule/schedule-day-sessions-list";
import { ScheduleDaySessionsSheet } from "@/components/marketing/schedule/schedule-day-sessions-sheet";
import { ScheduleListChrome } from "@/components/marketing/schedule/schedule-list-chrome";
import { ScheduleMonthBoard } from "@/components/marketing/schedule/schedule-month-board";
import { ScheduleWeekBoard } from "@/components/marketing/schedule/schedule-week-board";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import type { ScheduleAnimationPhase } from "@/components/marketing/schedule/use-schedule-day-transition";
import type { ScheduleLayoutMode } from "@/lib/schedule-layout-mode";
import type { ScheduleSessionEligibilityMap } from "@/lib/schedule-session-eligibility";
import type { UserSessionBookingMap } from "@/lib/user-session-bookings-map";

type SharedSessionListProps = {
  locale: string;
  audience: PublicPackageCategoryCardsAudience;
  sessionsReady: boolean;
  scheduleNow: Date;
  renderedDayKey: string;
  renderedSessions: readonly MarketingScheduleItem[];
  animationPhase: ScheduleAnimationPhase;
  contentRef: RefObject<HTMLDivElement | null>;
  getItemStyle: (index: number) => CSSProperties;
  bookedBySessionId: UserSessionBookingMap;
  waitlistedSessionIds: ReadonlySet<string>;
  memberWaitlistLoaded: boolean;
  memberActionStateReady: boolean;
  eligibilityBySessionId: ScheduleSessionEligibilityMap;
  eligibilityLoaded: boolean;
  onBooked: (sessionId: string, bookingId: string) => void;
  onCancelled: (sessionId: string) => void;
  onWaitlisted: (sessionId: string) => void;
  onWaitlistLeft: (sessionId: string) => void;
};

type MarketingScheduleLayoutBodyProps = {
  layoutMode: ScheduleLayoutMode;
  isDesktop: boolean;
  pageTitle: string;
  locale: string;
  selectedDate: Date;
  windowStart: Date;
  baseline: Date;
  weekFloor: Date;
  maxScheduleDate: Date;
  weekSessions: readonly MarketingScheduleItem[];
  sessionCountByDayKey: ReadonlyMap<string, number>;
  daySheetOpen: boolean;
  daySheetLabel: string;
  canShiftPrevWeek: boolean;
  canShiftNextWeek: boolean;
  layoutSwitcher: ReactNode;
  filtersHeader: ReactNode;
  sessionListProps: SharedSessionListProps;
  onSelectDay: (day: Date) => void;
  onSelectMonthDay: (day: Date) => void;
  onShiftWindow: (delta: number) => void;
  onCloseDaySheet: () => void;
};

/** Renders List / Week / Month schedule chrome for the public schedule page. */
export function MarketingScheduleLayoutBody({
  layoutMode,
  isDesktop,
  pageTitle,
  locale,
  selectedDate,
  windowStart,
  baseline,
  weekFloor,
  maxScheduleDate,
  weekSessions,
  sessionCountByDayKey,
  daySheetOpen,
  daySheetLabel,
  canShiftPrevWeek,
  canShiftNextWeek,
  layoutSwitcher,
  filtersHeader,
  sessionListProps,
  onSelectDay,
  onSelectMonthDay,
  onShiftWindow,
  onCloseDaySheet,
}: MarketingScheduleLayoutBodyProps) {
  const daySessionsList = <ScheduleDaySessionsList {...sessionListProps} />;
  const showWeekBoard = isDesktop && layoutMode === "week";
  const showMonthBoard = isDesktop && layoutMode === "month";

  if (showWeekBoard) {
    return (
      <ScheduleWeekBoard
        locale={locale}
        pageTitle={pageTitle}
        windowStart={windowStart}
        selectedDate={selectedDate}
        sessions={weekSessions}
        sessionsReady={sessionListProps.sessionsReady}
        scheduleNow={sessionListProps.scheduleNow}
        audience={sessionListProps.audience}
        bookedBySessionId={sessionListProps.bookedBySessionId}
        waitlistedSessionIds={sessionListProps.waitlistedSessionIds}
        memberWaitlistLoaded={sessionListProps.memberWaitlistLoaded}
        memberActionStateReady={sessionListProps.memberActionStateReady}
        eligibilityBySessionId={sessionListProps.eligibilityBySessionId}
        eligibilityLoaded={sessionListProps.eligibilityLoaded}
        minDate={weekFloor}
        maxDate={maxScheduleDate}
        canShiftPrev={canShiftPrevWeek}
        canShiftNext={canShiftNextWeek}
        filtersSlot={filtersHeader}
        layoutSwitcherSlot={layoutSwitcher}
        onSelectDay={onSelectDay}
        onShiftWindow={onShiftWindow}
        onBooked={sessionListProps.onBooked}
        onCancelled={sessionListProps.onCancelled}
        onWaitlisted={sessionListProps.onWaitlisted}
        onWaitlistLeft={sessionListProps.onWaitlistLeft}
      />
    );
  }

  if (showMonthBoard) {
    return (
      <>
        <ScheduleMonthBoard
          locale={locale}
          pageTitle={pageTitle}
          selectedDate={selectedDate}
          minDate={baseline}
          maxDate={maxScheduleDate}
          daySheetOpen={daySheetOpen}
          sessionCountByDayKey={sessionCountByDayKey}
          layoutSwitcherSlot={layoutSwitcher}
          filtersSlot={filtersHeader}
          onSelectDay={onSelectMonthDay}
        />
        <ScheduleDaySessionsSheet
          open={daySheetOpen}
          dayLabel={daySheetLabel}
          onClose={onCloseDaySheet}
        >
          {daySessionsList}
        </ScheduleDaySessionsSheet>
      </>
    );
  }

  return (
    <ScheduleListChrome
      locale={locale}
      pageTitle={pageTitle}
      selectedDate={selectedDate}
      windowStart={windowStart}
      minDate={baseline}
      maxDate={maxScheduleDate}
      showLayoutSwitcher={isDesktop}
      layoutSwitcher={layoutSwitcher}
      filtersSlot={filtersHeader}
      sessionsSlot={daySessionsList}
      onSelectDay={onSelectDay}
      onShiftWindow={onShiftWindow}
    />
  );
}
