"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SCHEDULE_VIEW_SHELL,
  SCHEDULE_VIEW_SHELL_FLUSH,
} from "@/components/marketing/schedule/schedule-public-design";
import {
  ScheduleFiltersHeader,
  type ScheduleFilterMultiOption,
} from "@/components/marketing/schedule/schedule-filters-header";
import { ScheduleLayoutSwitcher } from "@/components/marketing/schedule/schedule-layout-switcher";
import { MarketingScheduleLayoutBody } from "@/components/marketing/schedule/marketing-schedule-layout-body";
import {
  formatScheduleMonthTitle,
  addDays,
  isAfterCalendarDay,
  isBeforeCalendarDay,
  isSameCalendarDay,
  startOfLocalDay,
  startOfWeekSunday,
} from "@/components/marketing/schedule/schedule-date-utils";
import { formatDateForUi } from "@/lib/date-display";
import { isUpcomingPublicScheduleSession } from "@/lib/filter-public-schedule-items";
import { PUBLIC_SCHEDULE_RANGE_DAYS } from "@/lib/public-schedule-constants";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import {
  buildMarketingScheduleInitialNavFromItems,
  buildMarketingScheduleNavForDate,
  matchesMarketingScheduleFilters,
  PUBLIC_SCHEDULE_DATE_QUERY_KEY,
  resolveNearestUpcomingScheduleDate,
  shiftMarketingScheduleWeek,
  type MarketingScheduleNavState,
} from "@/components/marketing/schedule/marketing-schedule-nav.helpers";
import {
  marketingScheduleDayToOffset,
  marketingScheduleItemDate,
} from "@/components/marketing/schedule/marketing-schedule-item.helpers";
import { useScheduleDayTransition } from "@/components/marketing/schedule/use-schedule-day-transition";
import { useScheduleDesktopLayout } from "@/components/marketing/schedule/use-schedule-desktop-layout";
import { useScheduleLayoutMode } from "@/components/marketing/schedule/use-schedule-layout-mode";
import { getScheduleClassTypeValues } from "@/lib/schedule-class-types";
import { useMarketingAudience } from "@/hooks/use-marketing-audience";
import { useMarketingScheduleEligibility } from "@/hooks/use-marketing-schedule-eligibility";
import { useMarketingScheduleMemberState } from "@/components/marketing/schedule/use-marketing-schedule-member-state";
import { toLocalIsoDate } from "@/lib/local-iso-date";

type MarketingScheduleViewProps = {
  initialItems: MarketingScheduleItem[];
  pageTitle: string;
};

function formatSheetDayLabel(locale: string, date: Date): string {
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
    date,
  );
  return `${weekday}, ${formatDateForUi(date)}`;
}

export function MarketingScheduleView({
  initialItems,
  pageTitle,
}: MarketingScheduleViewProps) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const audience = useMarketingAudience();
  const isDesktop = useScheduleDesktopLayout();
  const { layoutMode, setLayoutMode } = useScheduleLayoutMode(isDesktop);
  const showWeekBoard = isDesktop && layoutMode === "week";
  const showMonthBoard = isDesktop && layoutMode === "month";
  const isMember = audience === "member";
  const [baseline] = useState(() => startOfLocalDay(new Date()));
  const weekFloor = useMemo(() => startOfWeekSunday(baseline), [baseline]);
  const dateParam = searchParams.get(PUBLIC_SCHEDULE_DATE_QUERY_KEY);
  const hasExplicitDateParam = dateParam !== null && dateParam.trim() !== "";
  const [nav, setNav] = useState<MarketingScheduleNavState>(() => {
    if (dateParam !== null && dateParam.trim() !== "") {
      const fromQuery = buildMarketingScheduleNavForDate(dateParam, baseline);
      if (fromQuery !== null) {
        return fromQuery;
      }
    }
    return buildMarketingScheduleInitialNavFromItems(baseline, initialItems);
  });
  const userPickedDateRef = useRef(hasExplicitDateParam);
  const [classTypes, setClassTypes] = useState<string[]>([]);
  const [instructors, setInstructors] = useState<string[]>([]);
  const [daySheetOpen, setDaySheetOpen] = useState(false);

  const {
    items,
    sessionsReady,
    bookedBySessionId,
    memberWaitlistLoaded,
    waitlistedSessionIds,
    memberActionStateReady,
    scheduleNow,
    handleBooked,
    handleCancelled,
    handleWaitlisted,
    handleWaitlistLeft,
  } = useMarketingScheduleMemberState({ isMember, initialItems });

  useEffect(() => {
    if (!showMonthBoard) {
      setDaySheetOpen(false);
    }
  }, [showMonthBoard]);

  useEffect(() => {
    if (userPickedDateRef.current || !sessionsReady) {
      return;
    }

    const nearest = resolveNearestUpcomingScheduleDate(items, baseline, scheduleNow);
    setNav((current) => {
      if (isSameCalendarDay(current.selectedDate, nearest)) {
        return current;
      }
      return {
        windowStart: startOfWeekSunday(nearest),
        selectedDate: nearest,
      };
    });
  }, [baseline, items, scheduleNow, sessionsReady]);

  const classTypeOptions = useMemo<readonly ScheduleFilterMultiOption[]>(
    () => getScheduleClassTypeValues(items).map((value) => ({ value, label: value })),
    [items],
  );

  const instructorOptions = useMemo<readonly ScheduleFilterMultiOption[]>(() => {
    const distinct = Array.from(
      new Set(items.map((item) => item.instructorName.trim())),
    ).filter((value) => value.length > 0);
    return distinct.map((value) => ({ value, label: value }));
  }, [items]);

  const dayToOffset = useMemo(() => marketingScheduleDayToOffset(), []);

  const weekDayKeys = useMemo(() => {
    return new Set(
      Array.from({ length: 7 }, (_, idx) =>
        toLocalIsoDate(addDays(nav.windowStart, idx)),
      ),
    );
  }, [nav.windowStart]);

  const weekSessions = useMemo(() => {
    const baselineWeekStart = startOfWeekSunday(baseline);
    return items
      .filter((item) => item.isActive)
      .filter((item) => matchesMarketingScheduleFilters(item, classTypes, instructors))
      .filter((item) => {
        const rowDay = marketingScheduleItemDate(item, baselineWeekStart, dayToOffset);
        return weekDayKeys.has(toLocalIsoDate(rowDay));
      });
  }, [baseline, classTypes, dayToOffset, instructors, items, weekDayKeys]);

  const visibleSessions = useMemo(() => {
    const baselineWeekStart = startOfWeekSunday(baseline);
    return items
      .filter((item) => item.isActive)
      .filter((item) => isUpcomingPublicScheduleSession(item, scheduleNow))
      .filter((item) => {
        const rowDay = marketingScheduleItemDate(item, baselineWeekStart, dayToOffset);
        if (!isSameCalendarDay(rowDay, nav.selectedDate)) return false;
        return matchesMarketingScheduleFilters(item, classTypes, instructors);
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [
    baseline,
    classTypes,
    dayToOffset,
    instructors,
    items,
    nav.selectedDate,
    scheduleNow,
  ]);

  const eligibilitySessionIds = useMemo(() => {
    const ids = new Set(weekSessions.map((item) => item.id));
    for (const item of visibleSessions) ids.add(item.id);
    return Array.from(ids);
  }, [visibleSessions, weekSessions]);

  const { eligibilityBySessionId, eligibilityLoaded } = useMarketingScheduleEligibility({
    isMember,
    sessionIds: eligibilitySessionIds,
  });

  const {
    contentRef,
    renderedDayKey,
    renderedSessions,
    animationPhase,
    getItemStyle,
  } = useScheduleDayTransition({
    selectedDayKey: toLocalIsoDate(nav.selectedDate),
    visibleSessions,
  });

  const selectDayFloor = showWeekBoard ? weekFloor : baseline;
  const maxScheduleDate = addDays(baseline, PUBLIC_SCHEDULE_RANGE_DAYS);
  const monthLabel = formatScheduleMonthTitle(locale, nav.selectedDate);

  function selectDay(day: Date) {
    if (isBeforeCalendarDay(day, selectDayFloor)) return;
    userPickedDateRef.current = true;
    setNav({ windowStart: startOfWeekSunday(day), selectedDate: day });
  }

  function selectMonthDay(day: Date) {
    selectDay(day);
    setDaySheetOpen(true);
  }

  function shiftWindow(delta: number) {
    userPickedDateRef.current = true;
    setNav((s) =>
      shiftMarketingScheduleWeek(s, delta, showWeekBoard ? weekFloor : baseline),
    );
  }

  return (
    <div
      className={
        showWeekBoard || showMonthBoard
          ? SCHEDULE_VIEW_SHELL_FLUSH
          : SCHEDULE_VIEW_SHELL
      }
    >
      <MarketingScheduleLayoutBody
        layoutMode={layoutMode}
        isDesktop={isDesktop}
        pageTitle={pageTitle}
        locale={locale}
        selectedDate={nav.selectedDate}
        windowStart={nav.windowStart}
        baseline={baseline}
        weekFloor={weekFloor}
        maxScheduleDate={maxScheduleDate}
        weekSessions={weekSessions}
        daySheetOpen={daySheetOpen}
        daySheetLabel={formatSheetDayLabel(locale, nav.selectedDate)}
        canShiftPrevWeek={
          !isBeforeCalendarDay(addDays(nav.windowStart, -1), weekFloor)
        }
        canShiftNextWeek={
          !isAfterCalendarDay(addDays(nav.windowStart, 7), maxScheduleDate)
        }
        layoutSwitcher={
          <ScheduleLayoutSwitcher value={layoutMode} onChange={setLayoutMode} />
        }
        filtersHeader={
          <ScheduleFiltersHeader
            monthLabel={monthLabel}
            hideMonthLabel={showWeekBoard || showMonthBoard}
            classTypes={classTypes}
            instructors={instructors}
            classTypeOptions={classTypeOptions}
            instructorOptions={instructorOptions}
            onClassTypesChange={setClassTypes}
            onInstructorsChange={setInstructors}
          />
        }
        sessionListProps={{
          locale,
          audience,
          sessionsReady,
          scheduleNow,
          renderedDayKey,
          renderedSessions,
          animationPhase,
          contentRef,
          getItemStyle,
          bookedBySessionId,
          waitlistedSessionIds,
          memberWaitlistLoaded,
          memberActionStateReady,
          eligibilityBySessionId,
          eligibilityLoaded,
          onBooked: handleBooked,
          onCancelled: handleCancelled,
          onWaitlisted: handleWaitlisted,
          onWaitlistLeft: handleWaitlistLeft,
        }}
        onSelectDay={selectDay}
        onSelectMonthDay={selectMonthDay}
        onShiftWindow={shiftWindow}
        onCloseDaySheet={() => setDaySheetOpen(false)}
      />
    </div>
  );
}
