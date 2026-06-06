"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { addDays, startOfLocalDay } from "@/components/marketing/schedule/schedule-date-utils";
import styles from "@/components/admin/admin-schedule-date-strip.module.css";
import { useHorizontalDragScroll } from "@/hooks/use-horizontal-drag-scroll";

const SCHEDULE_DATE_STRIP_HORIZON_DAYS = 90;
const SCHEDULE_DATE_STRIP_VISIBLE_CARD_COUNT = 10;
const SCHEDULE_DATE_STRIP_CARD_GAP_PX = 8;

const SCHEDULE_DATE_STRIP_COLUMN_WIDTH = `calc((100% - ${
  SCHEDULE_DATE_STRIP_CARD_GAP_PX * (SCHEDULE_DATE_STRIP_VISIBLE_CARD_COUNT - 1)
}px) / ${SCHEDULE_DATE_STRIP_VISIBLE_CARD_COUNT})`;

const SCHEDULE_DATE_STRIP_VIEWPORT_STYLE: CSSProperties = {
  gridAutoColumns: SCHEDULE_DATE_STRIP_COLUMN_WIDTH,
};

export type ScheduleDateStripRow = {
  startsAt: string;
};

type AdminScheduleDateStripProps = {
  locale: string;
  rows: readonly ScheduleDateStripRow[];
  selectedDay: string | null;
  onSelectDay: (day: string) => void;
};

function toLocalIsoDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function scheduleTodayIsoDate(): string {
  return toLocalIsoDate(startOfLocalDay(new Date()));
}

export function scheduleSessionLocalIsoDay(startsAt: string): string {
  return toLocalIsoDate(new Date(startsAt));
}

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

function scrollDayIntoView(container: HTMLDivElement, dayButton: HTMLButtonElement): void {
  const targetLeft = dayButton.offsetLeft - container.offsetLeft;
  const maxScroll = container.scrollWidth - container.clientWidth;
  container.scrollLeft = Math.max(0, Math.min(targetLeft, maxScroll));
}

type ScheduleDayCardProps = {
  locale: string;
  day: string;
  sessionCount: number;
  selected: boolean;
  onSelect: (day: string) => void;
  shouldSuppressClick: () => boolean;
  setButtonRef: (element: HTMLButtonElement | null) => void;
};

function ScheduleDayCard({
  locale,
  day,
  sessionCount,
  selected,
  onSelect,
  shouldSuppressClick,
  setButtonRef,
}: ScheduleDayCardProps) {
  const date = new Date(`${day}T00:00:00`);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
  const month = new Intl.DateTimeFormat(locale, { month: "short" }).format(date);
  const isActiveFilter = selected;

  return (
    <button
      ref={setButtonRef}
      type="button"
      aria-pressed={isActiveFilter}
      onClick={() => {
        if (shouldSuppressClick()) return;
        onSelect(day);
      }}
      className={`${styles.card} flex flex-col rounded-2xl border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700/25 ${
        isActiveFilter
          ? "border-sage-700/20 bg-sage-800 text-white shadow-[0_18px_34px_-24px_rgba(45,40,35,0.6)] ring-2 ring-sage-900/30"
          : "border-white/70 bg-white/75 text-sage-800 hover:-translate-y-0.5 hover:bg-white motion-safe:transition-[transform,background-color,border-color,box-shadow] motion-safe:duration-200"
      }`}
    >
      <span className="flex items-start justify-between gap-1">
        <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.12em] opacity-75">
          {weekday}
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            isActiveFilter ? "bg-white/20" : "bg-sand-50 text-sage-700"
          }`}
        >
          {sessionCount}
        </span>
      </span>
      <span className="flex min-h-0 flex-1 items-center justify-center">
        <span className={styles.dayNumber}>{date.getDate()}</span>
      </span>
      <span className="text-left text-sm font-medium capitalize opacity-75">{month}</span>
    </button>
  );
}

export function AdminScheduleDateStrip({
  locale,
  rows,
  selectedDay,
  onSelectDay,
}: AdminScheduleDateStripProps) {
  const { scrollRef, dragHandlers, shouldSuppressClick } = useHorizontalDragScroll();
  const todayButtonRef = useRef<HTMLButtonElement>(null);
  const hasScrolledToToday = useRef(false);

  const countsByDay = useMemo(() => groupRowsByDay(rows), [rows]);
  const days = useMemo(() => buildDateStripDays(rows), [rows]);
  const todayKey = scheduleTodayIsoDate();

  useEffect(() => {
    const container = scrollRef.current;
    const todayButton = todayButtonRef.current;
    if (!container || !todayButton || hasScrolledToToday.current) return;
    scrollDayIntoView(container, todayButton);
    hasScrolledToToday.current = true;
  }, [days, scrollRef]);

  if (days.length === 0) return null;

  return (
    <div className="rounded-[28px] border border-white/70 bg-white/55 p-4 shadow-[0_18px_44px_-30px_rgba(45,40,35,0.3)] backdrop-blur-md">
      <div
        ref={scrollRef}
        className={styles.viewport}
        style={SCHEDULE_DATE_STRIP_VIEWPORT_STYLE}
        {...dragHandlers}
      >
        {days.map((day) => (
          <ScheduleDayCard
            key={day}
            locale={locale}
            day={day}
            sessionCount={countsByDay.get(day) ?? 0}
            selected={selectedDay !== null && day === selectedDay}
            onSelect={onSelectDay}
            shouldSuppressClick={shouldSuppressClick}
            setButtonRef={(element) => {
              if (day === todayKey) {
                todayButtonRef.current = element;
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
