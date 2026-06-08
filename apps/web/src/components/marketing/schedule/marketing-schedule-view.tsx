"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import styles from "@/components/marketing/schedule/marketing-schedule-view.module.css";
import {
  SCHEDULE_DATE_STRIP_VISIBLE_DAYS,
  ScheduleDateControls,
} from "@/components/marketing/schedule/schedule-date-controls";
import {
  type ScheduleFilterOption,
} from "@/components/marketing/schedule/schedule-filter-dropdown";
import { ScheduleFiltersHeader } from "@/components/marketing/schedule/schedule-filters-header";
import { ScheduleSessionRow } from "@/components/marketing/schedule/schedule-session-row";
import { SCHEDULE_MUTED } from "@/components/marketing/schedule/schedule-public-design";
import {
  addDays,
  compareCalendarDays,
  isAfterCalendarDay,
  isBeforeCalendarDay,
  isSameCalendarDay,
  startOfLocalDay,
  startOfWeekSunday,
} from "@/components/marketing/schedule/schedule-date-utils";
import { PUBLIC_SCHEDULE_RANGE_DAYS } from "@/lib/public-schedule-constants";
import {
  type MarketingScheduleItem,
  type MarketingScheduleDayOfWeek,
} from "@/components/marketing/schedule/marketing-schedule-types";
import {
  useScheduleDayTransition,
} from "@/components/marketing/schedule/use-schedule-day-transition";
import { getScheduleClassTypeValues } from "@/lib/schedule-class-types";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";

type ScheduleNavState = {
  windowStart: Date;
  selectedDate: Date;
};

function buildInitialNav(baseline: Date): ScheduleNavState {
  const windowStart = startOfWeekSunday(baseline);
  return { windowStart, selectedDate: baseline };
}

function shiftWeek(
  prev: ScheduleNavState,
  deltaDays: number,
  today: Date,
  maxDate: Date,
): ScheduleNavState {
  if (
    deltaDays < 0 &&
    compareCalendarDays(
      addDays(prev.windowStart, deltaDays + SCHEDULE_DATE_STRIP_VISIBLE_DAYS - 1),
      today,
    ) < 0
  ) {
    return prev;
  }

  if (
    deltaDays > 0 &&
    isAfterCalendarDay(addDays(prev.windowStart, deltaDays), maxDate)
  ) {
    return prev;
  }

  const nextWs = addDays(prev.windowStart, deltaDays);
  const first = startOfLocalDay(nextWs);
  const last = addDays(first, 6);
  const sel = startOfLocalDay(prev.selectedDate);
  const outOfRange = sel.getTime() < first.getTime() || sel.getTime() > last.getTime();
  const nextSelected = outOfRange ? first : prev.selectedDate;
  let clampedSelected = isBeforeCalendarDay(nextSelected, today) ? today : nextSelected;
  if (isAfterCalendarDay(clampedSelected, maxDate)) {
    clampedSelected = maxDate;
  }

  return {
    windowStart: nextWs,
    selectedDate: clampedSelected,
  };
}

type MarketingScheduleViewProps = {
  initialItems: MarketingScheduleItem[];
  audience: PublicPackageCategoryCardsAudience;
};

function mapDayToDate(
  weekStart: Date,
  day: MarketingScheduleDayOfWeek,
  dayToOffset: Record<MarketingScheduleDayOfWeek, number>,
): Date {
  return addDays(weekStart, dayToOffset[day]);
}

function scheduleItemDate(
  item: MarketingScheduleItem,
  baselineWeekStart: Date,
  dayToOffset: Record<MarketingScheduleDayOfWeek, number>,
): Date {
  return item.sessionDate !== null
    ? startOfLocalDay(new Date(item.sessionDate))
    : mapDayToDate(baselineWeekStart, item.dayOfWeek, dayToOffset);
}

function toLocaleTime(locale: string, value: string): string {
  const [hour, minute] = value.split(":").map((part) => Number(part));
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function MarketingScheduleView({ initialItems, audience }: MarketingScheduleViewProps) {
  const t = useTranslations("marketingPages.schedule");
  const locale = useLocale();
  const [items] = useState<MarketingScheduleItem[]>(initialItems);
  const [baseline] = useState(() => startOfLocalDay(new Date()));
  const maxDate = useMemo(
    () => addDays(baseline, PUBLIC_SCHEDULE_RANGE_DAYS),
    [baseline],
  );
  const [nav, setNav] = useState<ScheduleNavState>(() => buildInitialNav(baseline));
  const [classType, setClassType] = useState("all");
  const [instructor, setInstructor] = useState("all");

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

  const dayToOffset = useMemo<Record<MarketingScheduleDayOfWeek, number>>(
    () => ({
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    }),
    [],
  );

  const visibleSessions = useMemo(() => {
    const baselineWeekStart = startOfWeekSunday(baseline);
    return items
      .filter((item) => item.isActive)
      .filter((item) => {
        const rowDay = scheduleItemDate(item, baselineWeekStart, dayToOffset);
        if (isAfterCalendarDay(rowDay, maxDate)) return false;
        if (!isSameCalendarDay(rowDay, nav.selectedDate)) return false;
        if (classType !== "all" && item.classType !== classType) return false;
        if (instructor !== "all" && item.instructorName !== instructor) return false;
        return true;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [baseline, maxDate, nav.selectedDate, classType, instructor, items, dayToOffset]);

  const selectedDayKey = nav.selectedDate.toISOString().slice(0, 10);
  const { contentRef, renderedDayKey, renderedSessions, animationPhase, containerStyle, getItemStyle } =
    useScheduleDayTransition({
      selectedDayKey,
      visibleSessions,
    });

  return (
    <div className="ommm-card flex w-full min-w-0 flex-col gap-6 p-5 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
      <ScheduleFiltersHeader
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
        maxDate={maxDate}
        onSelectDay={(d) => {
          if (isBeforeCalendarDay(d, baseline) || isAfterCalendarDay(d, maxDate)) return;
          setNav((s) => ({ ...s, selectedDate: d }));
        }}
        onShiftWindow={(delta) =>
          setNav((s) => shiftWeek(s, delta, baseline, maxDate))
        }
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
          <ul key={renderedDayKey} className="list-none overflow-hidden p-0">
            {renderedSessions.length === 0 ? (
              <li
                className={`py-12 text-center text-sm ${SCHEDULE_MUTED} ${
                  animationPhase === "enter" ? styles.scheduleItemEnter : ""
                }`}
              >
                {t("empty")}
              </li>
            ) : (
              renderedSessions.map((row, index) => (
                <ScheduleSessionRow
                  key={row.id}
                  row={row}
                  studioLabel={t("studioBrand")}
                  bookLabel={t("bookCta")}
                  audience={audience}
                  subtitle={`${row.instructorName} • ${row.classType}`}
                  timeLabel={toLocaleTime(locale, row.startTime)}
                  durationLabel={
                    row.durationMinutes !== null
                      ? t("minutesShort", { count: row.durationMinutes })
                      : row.endTime !== null
                        ? `${toLocaleTime(locale, row.startTime)} - ${toLocaleTime(locale, row.endTime)}`
                        : "-"
                  }
                  className={animationPhase === "enter" ? styles.scheduleItemEnter : ""}
                  style={getItemStyle(index)}
                />
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
