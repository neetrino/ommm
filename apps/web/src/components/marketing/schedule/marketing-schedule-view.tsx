"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import styles from "@/components/marketing/schedule/marketing-schedule-view.module.css";
import { ScheduleDateControls } from "@/components/marketing/schedule/schedule-date-controls";
import {
  type ScheduleFilterOption,
} from "@/components/marketing/schedule/schedule-filter-dropdown";
import { ScheduleFiltersHeader } from "@/components/marketing/schedule/schedule-filters-header";
import { ScheduleSessionRow } from "@/components/marketing/schedule/schedule-session-row";
import { SCHEDULE_MUTED } from "@/components/marketing/schedule/schedule-public-design";
import {
  addDays,
  isSameCalendarDay,
  startOfLocalDay,
  startOfWeekSunday,
} from "@/components/marketing/schedule/schedule-date-utils";
import {
  type MarketingScheduleItem,
  type MarketingScheduleDayOfWeek,
} from "@/components/marketing/schedule/marketing-schedule-types";
import {
  useScheduleDayTransition,
} from "@/components/marketing/schedule/use-schedule-day-transition";
import { getScheduleClassTypeValues } from "@/lib/schedule-class-types";

type ScheduleNavState = {
  windowStart: Date;
  selectedDate: Date;
};

function buildInitialNav(baseline: Date): ScheduleNavState {
  const windowStart = startOfWeekSunday(baseline);
  return { windowStart, selectedDate: baseline };
}

function shiftWeek(prev: ScheduleNavState, deltaDays: number): ScheduleNavState {
  const nextWs = addDays(prev.windowStart, deltaDays);
  const first = startOfLocalDay(nextWs);
  const last = addDays(first, 6);
  const sel = startOfLocalDay(prev.selectedDate);
  const outOfRange = sel.getTime() < first.getTime() || sel.getTime() > last.getTime();
  return {
    windowStart: nextWs,
    selectedDate: outOfRange ? first : prev.selectedDate,
  };
}

type MarketingScheduleViewProps = {
  initialItems: MarketingScheduleItem[];
};

function mapDayToDate(
  weekStart: Date,
  day: MarketingScheduleDayOfWeek,
  dayToOffset: Record<MarketingScheduleDayOfWeek, number>,
): Date {
  return addDays(weekStart, dayToOffset[day]);
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

export function MarketingScheduleView({ initialItems }: MarketingScheduleViewProps) {
  const t = useTranslations("marketingPages.schedule");
  const locale = useLocale();
  const [items] = useState<MarketingScheduleItem[]>(initialItems);
  const [baseline] = useState(() => startOfLocalDay(new Date()));
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
        const rowDay = mapDayToDate(baselineWeekStart, item.dayOfWeek, dayToOffset);
        if (!isSameCalendarDay(rowDay, nav.selectedDate)) return false;
        if (classType !== "all" && item.classType !== classType) return false;
        if (instructor !== "all" && item.instructorName !== instructor) return false;
        return true;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [baseline, nav.selectedDate, classType, instructor, items, dayToOffset]);

  const selectedDayKey = nav.selectedDate.toISOString().slice(0, 10);
  const { contentRef, renderedDayKey, renderedSessions, animationPhase, containerStyle, getItemStyle } =
    useScheduleDayTransition({
      selectedDayKey,
      visibleSessions,
    });

  return (
    <div className="ommm-card p-5 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
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
        onSelectDay={(d) => setNav((s) => ({ ...s, selectedDate: d }))}
        onShiftWindow={(delta) => setNav((s) => shiftWeek(s, delta))}
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
