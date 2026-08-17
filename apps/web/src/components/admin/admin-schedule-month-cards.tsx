"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminScheduleAllClassesCard } from "@/components/admin/admin-schedule-all-classes-button";
import styles from "@/components/admin/admin-schedule-month-cards.module.css";
import {
  addCalendarMonths,
  buildMondayFirstMonthCells,
  mondayFirstWeekdayLabels,
  yearMonthFromIsoDay,
} from "@/components/admin/admin-schedule-month-utils";
import type { ScheduleDateStripRow } from "@/components/admin/admin-schedule-date-strip";
import { scheduleSessionLocalIsoDay, scheduleTodayIsoDate } from "@/lib/local-iso-date";

type AdminScheduleMonthCardsProps = {
  locale: string;
  rows: readonly ScheduleDateStripRow[];
  totalSessionCount?: number;
  selectedDay: string | null;
  onSelectDay: (day: string) => void;
  onSelectAllDays: () => void;
};

function groupRowsByDay(rows: readonly ScheduleDateStripRow[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = scheduleSessionLocalIsoDay(row.startsAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function monthCardSurfaceClass(isToday: boolean, isSelected: boolean): string {
  if (isSelected) {
    return [
      "border-2 border-sage-800/55 bg-sand-100 text-sage-900",
      "shadow-[0_16px_34px_-22px_rgba(45,40,35,0.38)] ring-2 ring-sage-800/20",
    ].join(" ");
  }
  if (isToday) {
    return "border border-sage-800/30 bg-sand-50/90 text-sage-800";
  }
  return "border border-white/70 bg-white/75 text-sage-800 hover:bg-sand-50/80";
}

type MonthDayCardProps = {
  locale: string;
  day: string;
  sessionCount: number;
  isSelected: boolean;
  onSelect: () => void;
};

function MonthDayCard({ locale, day, sessionCount, isSelected, onSelect }: MonthDayCardProps) {
  const t = useTranslations("adminPages.schedule");
  const date = new Date(`${day}T00:00:00`);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
  const month = new Intl.DateTimeFormat(locale, { month: "short" }).format(date);
  const isToday = day === scheduleTodayIsoDate();
  const emphasize = isSelected || isToday;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-current={isToday ? "date" : undefined}
      aria-label={t("selectDayAria", {
        weekday,
        day: date.getDate(),
        month,
        count: sessionCount,
      })}
      onClick={onSelect}
      className={`${styles.card} flex flex-col rounded-2xl p-2 text-left transition-colors sm:p-3 ${monthCardSurfaceClass(
        isToday,
        isSelected,
      )}`}
    >
      <span className="flex items-start justify-between gap-0.5">
        <span
          className={[
            "min-w-0 truncate text-[9px] font-bold uppercase tracking-[0.1em] sm:text-[10px]",
            emphasize ? "text-sage-700" : "font-serif text-sage-950",
          ].join(" ")}
        >
          {isToday ? t("today") : weekday}
        </span>
        <span
          className={[
            "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:text-[11px]",
            isSelected
              ? "border border-sage-800/15 bg-white text-sage-800"
              : "bg-sand-50 text-sage-700",
          ].join(" ")}
        >
          {sessionCount}
        </span>
      </span>
      <span className="flex min-h-0 flex-1 items-center justify-center">
        <span
          className={[
            styles.dayNumber,
            "font-serif font-semibold text-sage-950",
            isSelected ? styles.cardTodayNumber : "",
          ].join(" ")}
        >
          {date.getDate()}
        </span>
      </span>
    </button>
  );
}

const MONTH_NAV_BUTTON_CLASS = [
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
  "border border-white/70 bg-white/80 text-sage-800 shadow-sm",
  "transition-[background-color,transform] hover:bg-white active:scale-[0.97]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/40",
].join(" ");

function MonthNavChevron({ direction }: { direction: "prev" | "next" }) {
  const isPrev = direction === "prev";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      {isPrev ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
    </svg>
  );
}

/** Month grid of day cards (filter-aware counts) for admin schedule monthly view. */
export function AdminScheduleMonthCards({
  locale,
  rows,
  totalSessionCount,
  selectedDay,
  onSelectDay,
  onSelectAllDays,
}: AdminScheduleMonthCardsProps) {
  const t = useTranslations("adminPages.schedule");
  const todayKey = scheduleTodayIsoDate();
  const [visibleMonth, setVisibleMonth] = useState(() =>
    yearMonthFromIsoDay(selectedDay ?? todayKey),
  );

  useEffect(() => {
    if (selectedDay === null) return;
    setVisibleMonth(yearMonthFromIsoDay(selectedDay));
  }, [selectedDay]);

  const countsByDay = useMemo(() => groupRowsByDay(rows), [rows]);
  const cells = useMemo(() => buildMondayFirstMonthCells(visibleMonth), [visibleMonth]);
  const weekdayLabels = useMemo(() => mondayFirstWeekdayLabels(locale), [locale]);
  const monthTitle = useMemo(() => {
    const date = new Date(`${visibleMonth}-01T00:00:00`);
    return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
  }, [locale, visibleMonth]);

  const allClassesCount = totalSessionCount ?? rows.length;
  const isAllSelected = selectedDay === null;

  return (
    <div className="rounded-[28px] border border-white/70 bg-white/55 p-4 shadow-[0_18px_44px_-30px_rgba(45,40,35,0.3)] backdrop-blur-md">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AdminScheduleAllClassesCard
          sessionCount={allClassesCount}
          isSelected={isAllSelected}
          onSelect={onSelectAllDays}
        />
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:justify-end">
          <button
            type="button"
            className={MONTH_NAV_BUTTON_CLASS}
            aria-label={t("monthView.previousMonth")}
            onClick={() => setVisibleMonth((current) => addCalendarMonths(current, -1))}
          >
            <MonthNavChevron direction="prev" />
          </button>
          <h2 className="min-w-0 truncate text-center font-serif text-lg font-semibold capitalize text-sage-950 sm:text-xl">
            {monthTitle}
          </h2>
          <button
            type="button"
            className={MONTH_NAV_BUTTON_CLASS}
            aria-label={t("monthView.nextMonth")}
            onClick={() => setVisibleMonth((current) => addCalendarMonths(current, 1))}
          >
            <MonthNavChevron direction="next" />
          </button>
        </div>
      </div>

      <div className={styles.grid} role="grid" aria-label={t("monthView.gridAria", { month: monthTitle })}>
        {weekdayLabels.map((label) => (
          <div key={label} className={styles.weekdayLabel} role="columnheader">
            {label}
          </div>
        ))}
        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className={styles.emptyCell} aria-hidden />;
          }
          return (
            <MonthDayCard
              key={day}
              locale={locale}
              day={day}
              sessionCount={countsByDay.get(day) ?? 0}
              isSelected={selectedDay === day}
              onSelect={() => onSelectDay(day)}
            />
          );
        })}
      </div>
    </div>
  );
}
