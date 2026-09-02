"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SCHEDULE_VIEW_SHELL,
  SCHEDULE_VIEW_SHELL_FLUSH,
} from "@/components/marketing/schedule/schedule-public-design";
import { ScheduleDateControls } from "@/components/marketing/schedule/schedule-date-controls";
import { ScheduleDaySessionsList } from "@/components/marketing/schedule/schedule-day-sessions-list";
import { type ScheduleFilterOption } from "@/components/marketing/schedule/schedule-filter-dropdown";
import { ScheduleFiltersHeader } from "@/components/marketing/schedule/schedule-filters-header";
import { ScheduleWeekBoard } from "@/components/marketing/schedule/schedule-week-board";
import pageStyles from "@/components/marketing/schedule/marketing-schedule-page-section.module.css";
import {
  formatScheduleMonthTitle,
  addDays,
  isAfterCalendarDay,
  isBeforeCalendarDay,
  isSameCalendarDay,
  startOfLocalDay,
  startOfWeekSunday,
} from "@/components/marketing/schedule/schedule-date-utils";
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
import { isUpcomingPublicScheduleSession } from "@/lib/filter-public-schedule-items";
import { getScheduleClassTypeValues } from "@/lib/schedule-class-types";
import { useMarketingAudience } from "@/hooks/use-marketing-audience";
import { useMarketingScheduleMemberState } from "@/components/marketing/schedule/use-marketing-schedule-member-state";
import { toLocalIsoDate } from "@/lib/local-iso-date";

type MarketingScheduleViewProps = {
  initialItems: MarketingScheduleItem[];
  pageTitle: string;
};

function resolveInitialNav(
  baseline: Date,
  dateParam: string | null,
  items: readonly MarketingScheduleItem[],
): MarketingScheduleNavState {
  if (dateParam !== null && dateParam.trim() !== "") {
    const fromQuery = buildMarketingScheduleNavForDate(dateParam, baseline);
    if (fromQuery !== null) {
      return fromQuery;
    }
  }
  return buildMarketingScheduleInitialNavFromItems(baseline, items);
}

export function MarketingScheduleView({
  initialItems,
  pageTitle,
}: MarketingScheduleViewProps) {
  const t = useTranslations("marketingPages.schedule");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const audience = useMarketingAudience();
  const isDesktop = useScheduleDesktopLayout();
  const isMember = audience === "member";
  const [baseline] = useState(() => startOfLocalDay(new Date()));
  const dateParam = searchParams.get(PUBLIC_SCHEDULE_DATE_QUERY_KEY);
  const hasExplicitDateParam = dateParam !== null && dateParam.trim() !== "";
  const [nav, setNav] = useState<MarketingScheduleNavState>(() =>
    resolveInitialNav(baseline, dateParam, initialItems),
  );
  const userPickedDateRef = useRef(hasExplicitDateParam);
  const [classType, setClassType] = useState("all");
  const [instructor, setInstructor] = useState("all");

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

  const classTypeOptions = useMemo<readonly ScheduleFilterOption<string>[]>(() => {
    const distinct = getScheduleClassTypeValues(items);
    return [
      { value: "all", label: t("filterClassTypeAll") },
      ...distinct.map((value) => ({ value, label: value })),
    ];
  }, [items, t]);

  const instructorOptions = useMemo<readonly ScheduleFilterOption<string>[]>(() => {
    const distinct = Array.from(
      new Set(items.map((item) => item.instructorName.trim())),
    ).filter((value) => value.length > 0);
    return [
      { value: "all", label: t("filterInstructorAll") },
      ...distinct.map((value) => ({ value, label: value })),
    ];
  }, [items, t]);

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
      .filter((item) => matchesMarketingScheduleFilters(item, classType, instructor))
      .filter((item) => {
        const rowDay = marketingScheduleItemDate(item, baselineWeekStart, dayToOffset);
        return weekDayKeys.has(toLocalIsoDate(rowDay));
      });
  }, [baseline, classType, dayToOffset, instructor, items, weekDayKeys]);

  const visibleSessions = useMemo(() => {
    const baselineWeekStart = startOfWeekSunday(baseline);
    return items
      .filter((item) => item.isActive)
      .filter((item) => isUpcomingPublicScheduleSession(item, scheduleNow))
      .filter((item) => {
        const rowDay = marketingScheduleItemDate(item, baselineWeekStart, dayToOffset);
        if (!isSameCalendarDay(rowDay, nav.selectedDate)) return false;
        return matchesMarketingScheduleFilters(item, classType, instructor);
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [
    baseline,
    classType,
    dayToOffset,
    instructor,
    items,
    nav.selectedDate,
    scheduleNow,
  ]);

  const monthLabel = formatScheduleMonthTitle(locale, nav.selectedDate);
  const selectedDayKey = nav.selectedDate.toISOString().slice(0, 10);
  const {
    contentRef,
    renderedDayKey,
    renderedSessions,
    animationPhase,
    containerStyle,
    getItemStyle,
  } = useScheduleDayTransition({
    selectedDayKey,
    visibleSessions,
  });

  function selectDay(day: Date) {
    if (isBeforeCalendarDay(day, baseline)) return;
    userPickedDateRef.current = true;
    setNav({
      windowStart: startOfWeekSunday(day),
      selectedDate: day,
    });
  }

  return (
    <div className={isDesktop ? SCHEDULE_VIEW_SHELL_FLUSH : SCHEDULE_VIEW_SHELL}>
      {isDesktop ? null : (
        <>
          <header className={`${pageStyles.hero} ${pageStyles.heroSpaced}`}>
            <h1 className={pageStyles.title}>{pageTitle}</h1>
          </header>
          <ScheduleFiltersHeader
            monthLabel={monthLabel}
            filterClassType={classType}
            filterInstructor={instructor}
            classTypeOptions={classTypeOptions}
            instructorOptions={instructorOptions}
            onClassTypeChange={setClassType}
            onInstructorChange={setInstructor}
          />
          <ScheduleDateControls
            locale={locale}
            selectedDate={nav.selectedDate}
            windowStart={nav.windowStart}
            maxDate={addDays(baseline, PUBLIC_SCHEDULE_RANGE_DAYS)}
            onSelectDay={selectDay}
            onShiftWindow={(delta) => {
              userPickedDateRef.current = true;
              setNav((s) => shiftMarketingScheduleWeek(s, delta, baseline));
            }}
          />
        </>
      )}

      {isDesktop ? (
        <ScheduleWeekBoard
          locale={locale}
          pageTitle={pageTitle}
          windowStart={nav.windowStart}
          selectedDate={nav.selectedDate}
          sessions={weekSessions}
          sessionsReady={sessionsReady}
          scheduleNow={scheduleNow}
          audience={audience}
          bookedBySessionId={bookedBySessionId}
          waitlistedSessionIds={waitlistedSessionIds}
          memberWaitlistLoaded={memberWaitlistLoaded}
          memberActionStateReady={memberActionStateReady}
          minDate={baseline}
          maxDate={addDays(baseline, PUBLIC_SCHEDULE_RANGE_DAYS)}
          canShiftPrev={
            !isBeforeCalendarDay(addDays(nav.windowStart, -1), baseline)
          }
          canShiftNext={
            !isAfterCalendarDay(
              addDays(nav.windowStart, 7),
              addDays(baseline, PUBLIC_SCHEDULE_RANGE_DAYS),
            )
          }
          filtersSlot={
            <ScheduleFiltersHeader
              monthLabel={monthLabel}
              hideMonthLabel
              filterClassType={classType}
              filterInstructor={instructor}
              classTypeOptions={classTypeOptions}
              instructorOptions={instructorOptions}
              onClassTypeChange={setClassType}
              onInstructorChange={setInstructor}
            />
          }
          onSelectDay={selectDay}
          onShiftWindow={(delta) => {
            userPickedDateRef.current = true;
            setNav((s) => shiftMarketingScheduleWeek(s, delta, baseline));
          }}
          onBooked={handleBooked}
          onCancelled={handleCancelled}
          onWaitlisted={handleWaitlisted}
          onWaitlistLeft={handleWaitlistLeft}
        />
      ) : (
        <ScheduleDaySessionsList
          locale={locale}
          audience={audience}
          sessionsReady={sessionsReady}
          renderedDayKey={renderedDayKey}
          renderedSessions={renderedSessions}
          animationPhase={animationPhase}
          containerStyle={containerStyle}
          contentRef={contentRef}
          getItemStyle={getItemStyle}
          bookedBySessionId={bookedBySessionId}
          waitlistedSessionIds={waitlistedSessionIds}
          memberWaitlistLoaded={memberWaitlistLoaded}
          memberActionStateReady={memberActionStateReady}
          onBooked={handleBooked}
          onCancelled={handleCancelled}
          onWaitlisted={handleWaitlisted}
          onWaitlistLeft={handleWaitlistLeft}
        />
      )}
    </div>
  );
}
