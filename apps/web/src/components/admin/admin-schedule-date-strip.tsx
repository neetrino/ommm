"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { addDays, startOfLocalDay } from "@/components/marketing/schedule/schedule-date-utils";
import { AdminScheduleAllClassesCard } from "@/components/admin/admin-schedule-all-classes-button";
import styles from "@/components/admin/admin-schedule-date-strip.module.css";
import { useHorizontalDragScroll } from "@/hooks/use-horizontal-drag-scroll";
import {
  scheduleSessionLocalIsoDay,
  scheduleTodayIsoDate,
  toLocalIsoDate,
} from "@/lib/local-iso-date";

export { scheduleSessionLocalIsoDay, scheduleTodayIsoDate };

const SCHEDULE_DATE_STRIP_HORIZON_DAYS = 90;

export type ScheduleDateStripRow = {
  startsAt: string;
};

type AdminScheduleDateStripProps = {
  locale: string;
  /** Full filtered set for day counts — independent of list pagination. */
  rows: readonly ScheduleDateStripRow[];
  /** Optional total override (e.g. server `listPagination.total`). */
  totalSessionCount?: number;
  /** ISO day (`YYYY-MM-DD`) when the list is filtered to a single day; null = all. */
  selectedDay: string | null;
  onSelectDay: (day: string) => void;
  onSelectAllDays: () => void;
};

/** Default list order: today and future first (asc), past sessions last (asc). */
export function sortScheduleRowsFromTodayForward<T extends ScheduleDateStripRow>(
  rows: readonly T[],
): T[] {
  const todayKey = scheduleTodayIsoDate();
  return [...rows].sort((first, second) => {
    const firstDay = scheduleSessionLocalIsoDay(first.startsAt);
    const secondDay = scheduleSessionLocalIsoDay(second.startsAt);
    const firstIsPast = firstDay < todayKey;
    const secondIsPast = secondDay < todayKey;
    if (firstIsPast !== secondIsPast) {
      return firstIsPast ? 1 : -1;
    }
    return first.startsAt.localeCompare(second.startsAt);
  });
}

function groupRowsByDay(rows: readonly ScheduleDateStripRow[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = scheduleSessionLocalIsoDay(row.startsAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function buildDateStripDays(rows: readonly ScheduleDateStripRow[]): string[] {
  const today = startOfLocalDay(new Date());
  const todayKey = toLocalIsoDate(today);
  const daySet = new Set<string>();

  for (let index = 0; index < SCHEDULE_DATE_STRIP_HORIZON_DAYS; index += 1) {
    daySet.add(toLocalIsoDate(addDays(today, index)));
  }

  for (const row of rows) {
    const key = scheduleSessionLocalIsoDay(row.startsAt);
    if (key >= todayKey) {
      daySet.add(key);
    }
  }

  return Array.from(daySet).sort();
}

function scrollDayIntoView(container: HTMLDivElement, dayCard: HTMLElement): void {
  const targetLeft = dayCard.offsetLeft - container.offsetLeft;
  const maxScroll = container.scrollWidth - container.clientWidth;
  container.scrollLeft = Math.max(0, Math.min(targetLeft, maxScroll));
}

function scheduleDayCardSurfaceClass(isToday: boolean, isSelected: boolean): string {
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

type ScheduleDayCardProps = {
  locale: string;
  day: string;
  sessionCount: number;
  isSelected: boolean;
  setCardRef: (element: HTMLButtonElement | null) => void;
  onSelect: () => void;
};

function ScheduleDayCard({
  locale,
  day,
  sessionCount,
  isSelected,
  setCardRef,
  onSelect,
}: ScheduleDayCardProps) {
  const t = useTranslations("adminPages.schedule");
  const date = new Date(`${day}T00:00:00`);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
  const month = new Intl.DateTimeFormat(locale, { month: "short" }).format(date);
  const isToday = day === scheduleTodayIsoDate();
  const emphasize = isSelected || isToday;

  const weekdayClass = [
    "min-w-0 truncate text-[10px] font-bold uppercase tracking-[0.12em]",
    emphasize ? "text-sage-700" : "font-serif text-sage-950",
  ].join(" ");

  const todayBadgeClass =
    "truncate text-[9px] font-bold uppercase tracking-[0.14em] text-sage-800";

  const monthClass = [
    "text-left text-sm font-semibold uppercase tracking-wide",
    emphasize ? "text-sage-700" : "font-serif text-sage-950",
  ].join(" ");

  const dayNumberClass = [
    styles.dayNumber,
    "font-serif leading-none font-semibold text-sage-950",
    isSelected ? styles.cardTodayNumber : "",
  ].join(" ");

  const countBadgeClass = [
    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
    isSelected
      ? "border border-sage-800/15 bg-white text-sage-800"
      : "bg-sand-50 text-sage-700",
  ].join(" ");

  return (
    <button
      type="button"
      ref={setCardRef}
      aria-pressed={isSelected}
      aria-current={isToday ? "date" : undefined}
      aria-label={t("selectDayAria", {
        weekday,
        day: date.getDate(),
        month,
        count: sessionCount,
      })}
      onClick={onSelect}
      className={`${styles.card} flex flex-col rounded-2xl p-3 text-left transition-colors ${scheduleDayCardSurfaceClass(
        isToday,
        isSelected,
      )}`}
    >
      <span className="flex items-start justify-between gap-1">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className={weekdayClass}>{weekday}</span>
          {isToday ? <span className={todayBadgeClass}>{t("today")}</span> : null}
        </span>
        <span className={countBadgeClass}>{sessionCount}</span>
      </span>
      <span className="flex min-h-0 flex-1 items-center justify-center">
        <span className={dayNumberClass}>{date.getDate()}</span>
      </span>
      <span className={monthClass}>{month}</span>
    </button>
  );
}

export function AdminScheduleDateStrip({
  locale,
  rows,
  totalSessionCount,
  selectedDay,
  onSelectDay,
  onSelectAllDays,
}: AdminScheduleDateStripProps) {
  const { scrollRef, dragHandlers, shouldSuppressClick } = useHorizontalDragScroll();
  const todayCardRef = useRef<HTMLButtonElement>(null);
  const hasScrolledToToday = useRef(false);

  const countsByDay = useMemo(() => groupRowsByDay(rows), [rows]);
  const days = useMemo(() => buildDateStripDays(rows), [rows]);
  const todayKey = scheduleTodayIsoDate();
  const allClassesCount = totalSessionCount ?? rows.length;
  const isAllSelected = selectedDay === null;

  useEffect(() => {
    const container = scrollRef.current;
    const todayCard = todayCardRef.current;
    if (!container || !todayCard || hasScrolledToToday.current) return;
    scrollDayIntoView(container, todayCard);
    hasScrolledToToday.current = true;
  }, [days, scrollRef]);

  if (days.length === 0) return null;

  return (
    <div className="rounded-[28px] border border-white/70 bg-white/55 p-4 shadow-[0_18px_44px_-30px_rgba(45,40,35,0.3)] backdrop-blur-md">
      <div className="flex min-w-0 items-stretch gap-2">
        <AdminScheduleAllClassesCard
          sessionCount={allClassesCount}
          isSelected={isAllSelected}
          onSelect={onSelectAllDays}
        />
        <div
          ref={scrollRef}
          className={styles.viewport}
          {...dragHandlers}
        >
          {days.map((day) => (
            <ScheduleDayCard
              key={day}
              locale={locale}
              day={day}
              sessionCount={countsByDay.get(day) ?? 0}
              isSelected={selectedDay === day}
              setCardRef={(element) => {
                if (day === todayKey) {
                  todayCardRef.current = element;
                }
              }}
              onSelect={() => {
                if (shouldSuppressClick()) return;
                onSelectDay(day);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
