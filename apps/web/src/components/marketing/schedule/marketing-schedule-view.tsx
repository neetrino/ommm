"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  resolveMemberOnWaitlistBadge,
  resolveMemberScheduleRowDisplay,
} from "@/lib/schedule-session-spots";
import {
  SCHEDULE_SESSION_LIST,
  SCHEDULE_VIEW_SHELL,
} from "@/components/marketing/schedule/schedule-public-design";
import styles from "@/components/marketing/schedule/marketing-schedule-view.module.css";
import { ScheduleDateControls } from "@/components/marketing/schedule/schedule-date-controls";
import { type ScheduleFilterOption } from "@/components/marketing/schedule/schedule-filter-dropdown";
import { ScheduleFiltersHeader } from "@/components/marketing/schedule/schedule-filters-header";
import { ScheduleSessionRow } from "@/components/marketing/schedule/schedule-session-row";
import {
  formatScheduleMonthTitle,
  addDays,
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
import { isUpcomingPublicScheduleSession } from "@/lib/filter-public-schedule-items";
import { formatScheduleTimeHHmm } from "@/lib/format-time-display";
import { getScheduleClassTypeValues } from "@/lib/schedule-class-types";
import { useMarketingAudience } from "@/hooks/use-marketing-audience";
import { MarketingScheduleSessionsSkeleton } from "@/components/marketing/schedule/marketing-schedule-sessions-skeleton";
import { ScheduleEmptyState } from "@/components/marketing/schedule/schedule-empty-state";
import { useMarketingScheduleMemberState } from "@/components/marketing/schedule/use-marketing-schedule-member-state";

type MarketingScheduleViewProps = {
  initialItems: MarketingScheduleItem[];
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

export function MarketingScheduleView({ initialItems }: MarketingScheduleViewProps) {
  const t = useTranslations("marketingPages.schedule");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const audience = useMarketingAudience();
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

  const visibleSessions = useMemo(() => {
    const baselineWeekStart = startOfWeekSunday(baseline);
    return items
      .filter((item) => item.isActive)
      .filter((item) => isUpcomingPublicScheduleSession(item, scheduleNow))
      .filter((item) => {
        const rowDay = marketingScheduleItemDate(item, baselineWeekStart, dayToOffset);
        if (!isSameCalendarDay(rowDay, nav.selectedDate)) return false;
        if (classType !== "all" && item.classType !== classType) return false;
        if (instructor !== "all" && item.instructorName !== instructor) return false;
        return true;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [baseline, classType, dayToOffset, instructor, items, nav.selectedDate, scheduleNow]);

  const monthLabel = formatScheduleMonthTitle(locale, nav.selectedDate);
  const selectedDayKey = nav.selectedDate.toISOString().slice(0, 10);
  const { contentRef, renderedDayKey, renderedSessions, animationPhase, containerStyle, getItemStyle } =
    useScheduleDayTransition({
      selectedDayKey,
      visibleSessions,
    });

  return (
    <div className={SCHEDULE_VIEW_SHELL}>
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
        onSelectDay={(d) => {
          if (isBeforeCalendarDay(d, baseline)) return;
          userPickedDateRef.current = true;
          setNav({
            windowStart: startOfWeekSunday(d),
            selectedDate: d,
          });
        }}
        onShiftWindow={(delta) => {
          userPickedDateRef.current = true;
          setNav((s) => shiftMarketingScheduleWeek(s, delta, baseline));
        }}
      />
      <div
        className="mt-0 overflow-hidden transition-[height] duration-300 ease-out motion-reduce:transition-none"
        style={containerStyle}
      >
        <div
          ref={contentRef}
          className={
            animationPhase === "exit"
              ? styles.scheduleListExit
              : animationPhase === "enter"
                ? styles.scheduleListEnter
                : ""
          }
        >
          <ul key={renderedDayKey} className={SCHEDULE_SESSION_LIST}>
            {!sessionsReady ? (
              <MarketingScheduleSessionsSkeleton />
            ) : renderedSessions.length === 0 ? (
              <li
                className={animationPhase === "enter" ? styles.scheduleItemEnter : ""}
                style={getItemStyle(0)}
              >
                <ScheduleEmptyState />
              </li>
            ) : (
              renderedSessions.map((row, index) => {
                const userOnWaitlist =
                  bookedBySessionId[row.id] === undefined && waitlistedSessionIds.has(row.id);
                const displayRow = resolveMemberScheduleRowDisplay({
                  row,
                  onWaitlist: userOnWaitlist,
                  capacityReady: memberWaitlistLoaded,
                });
                const showOnWaitlist = resolveMemberOnWaitlistBadge({
                  userBookingId: bookedBySessionId[row.id],
                  onWaitlist: userOnWaitlist,
                  availableSpots: displayRow.availableSpots,
                  sessionStatus: displayRow.status,
                  capacityReady: memberWaitlistLoaded,
                });

                return (
                  <ScheduleSessionRow
                    key={row.id}
                    row={displayRow}
                    locale={locale}
                    bookLabel={t("bookCta")}
                    audience={audience}
                    withInstructorLabel={t("withInstructor", { name: row.instructorName })}
                    spotsFullLabel={t("spotsFull")}
                    spotsLeftLabel={t("spotsLeft", { count: displayRow.availableSpots })}
                    spotsLoadingLabel={t("actionLoading")}
                    durationLabel={
                      row.durationMinutes !== null
                        ? t("minutesShort", { count: row.durationMinutes })
                        : row.endTime !== null
                          ? `${formatScheduleTimeHHmm(locale, row.startTime)} - ${formatScheduleTimeHHmm(locale, row.endTime)}`
                          : "-"
                    }
                    userBookingId={bookedBySessionId[row.id]}
                    bookingStateReady={memberActionStateReady}
                    isOnWaitlist={showOnWaitlist}
                    onBooked={handleBooked}
                    onCancelled={handleCancelled}
                    onWaitlisted={handleWaitlisted}
                    onWaitlistLeft={handleWaitlistLeft}
                    className={animationPhase === "enter" ? styles.scheduleItemEnter : ""}
                    style={getItemStyle(index)}
                  />
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
