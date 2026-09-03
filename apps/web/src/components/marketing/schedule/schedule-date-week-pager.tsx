"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type UIEvent,
} from "react";
import {
  SCHEDULE_DATE_CHIP_IDLE,
  SCHEDULE_DATE_CHIP_PAST,
  SCHEDULE_DATE_CHIP_SELECTED,
  SCHEDULE_DATE_CHIP_TODAY,
  SCHEDULE_WEEKDAY_LABEL,
  SCHEDULE_WEEKDAY_LABEL_ACTIVE,
} from "@/components/marketing/schedule/schedule-public-design";
import {
  addDays,
  compareCalendarDays,
  isAfterCalendarDay,
  isBeforeCalendarDay,
  isSameCalendarDay,
  startOfLocalDay,
  startOfWeekSunday,
} from "@/components/marketing/schedule/schedule-date-utils";
import styles from "@/components/marketing/schedule/schedule-public-design.module.css";

const DAYS_PER_WEEK = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
/** Wait past iOS momentum + snap before reading the settled page. */
const SCROLL_SETTLE_MS = 160;

function formatWeekdayShort(locale: string, date: Date): string {
  return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
}

/** Full Sunday–Saturday weeks from the week of `rangeStart` through the week of `maxDate`. */
function buildStripWeeks(rangeStart: Date, maxDate: Date): Date[][] {
  const start = startOfWeekSunday(rangeStart);
  const lastWeekStart = startOfWeekSunday(maxDate);
  const end = addDays(lastWeekStart, DAYS_PER_WEEK - 1);
  const totalDays =
    Math.floor(compareCalendarDays(end, start) / MS_PER_DAY) + 1;
  const days = Array.from({ length: Math.max(totalDays, 1) }, (_, idx) =>
    addDays(start, idx),
  );
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += DAYS_PER_WEEK) {
    weeks.push(days.slice(i, i + DAYS_PER_WEEK));
  }
  return weeks;
}

function weekIndexForDate(weeks: Date[][], date: Date): number {
  return Math.max(
    0,
    weeks.findIndex((week) =>
      week.some((day) => isSameCalendarDay(day, date)),
    ),
  );
}

function pickDayInWeek(
  week: Date[],
  preferred: Date,
  earliestDate: Date,
  maxDate: Date | undefined,
): Date {
  const inRange = (day: Date) =>
    !isBeforeCalendarDay(day, earliestDate) &&
    (maxDate === undefined || !isAfterCalendarDay(day, maxDate));

  if (
    week.some((day) => isSameCalendarDay(day, preferred)) &&
    inRange(preferred)
  ) {
    return startOfLocalDay(preferred);
  }

  const bookable = week.find(inRange);
  return startOfLocalDay(bookable ?? week[0] ?? preferred);
}

type ScheduleDateWeekPagerProps = {
  locale: string;
  selectedDate: Date;
  earliestDate: Date;
  maxDate: Date | undefined;
  today: Date;
  onSelectDay: (day: Date) => void;
};

/**
 * Mobile week strip — CSS scroll-snap owns paging.
 * Selection follows scroll; we never fight snap with scrollTo after a swipe
 * (that feedback loop was the main week-swipe jitter).
 */
export function ScheduleDateWeekPager({
  locale,
  selectedDate,
  earliestDate,
  maxDate,
  today,
  onSelectDay,
}: ScheduleDateWeekPagerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressScrollSyncRef = useRef(false);
  const selectionFromSwipeRef = useRef(false);
  const selectedDateRef = useRef(selectedDate);
  const [pageWidth, setPageWidth] = useState(0);
  const rangeEnd = maxDate ?? addDays(today, 30);
  const earliestKey = earliestDate.getTime();
  const rangeEndKey = rangeEnd.getTime();
  const weeks = useMemo(
    () => buildStripWeeks(new Date(earliestKey), new Date(rangeEndKey)),
    [earliestKey, rangeEndKey],
  );

  selectedDateRef.current = selectedDate;

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el === null) {
      return;
    }
    const updateWidth = () => {
      const width = el.clientWidth;
      if (width > 0) {
        setPageWidth((prev) => (prev === width ? prev : width));
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /** Align strip only for external selection (calendar / first paint) — never after swipe. */
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el === null || pageWidth <= 0) {
      return;
    }
    if (selectionFromSwipeRef.current) {
      selectionFromSwipeRef.current = false;
      return;
    }
    const index = weekIndexForDate(weeks, selectedDate);
    const target = index * pageWidth;
    if (Math.abs(el.scrollLeft - target) < 1) {
      return;
    }
    suppressScrollSyncRef.current = true;
    el.scrollLeft = target;
    window.requestAnimationFrame(() => {
      suppressScrollSyncRef.current = false;
    });
  }, [pageWidth, selectedDate, weeks]);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current !== null) {
        clearTimeout(settleTimerRef.current);
      }
    };
  }, []);

  const syncSelectionFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el === null || pageWidth <= 0 || suppressScrollSyncRef.current) {
      return;
    }
    const index = Math.round(el.scrollLeft / pageWidth);
    const week = weeks[index];
    if (week === undefined) {
      return;
    }
    const preferred = selectedDateRef.current;
    const nextDay = pickDayInWeek(week, preferred, earliestDate, maxDate);
    if (!isSameCalendarDay(nextDay, preferred)) {
      selectionFromSwipeRef.current = true;
      onSelectDay(nextDay);
    }
  }, [earliestDate, maxDate, onSelectDay, pageWidth, weeks]);

  function onStripScroll(event: UIEvent<HTMLDivElement>) {
    void event;
    if (suppressScrollSyncRef.current) {
      return;
    }
    if (settleTimerRef.current !== null) {
      clearTimeout(settleTimerRef.current);
    }
    settleTimerRef.current = setTimeout(() => {
      settleTimerRef.current = null;
      syncSelectionFromScroll();
    }, SCROLL_SETTLE_MS);
  }

  return (
    <div
      ref={scrollRef}
      className={styles.dateStripScroll}
      onScroll={onStripScroll}
    >
      {weeks.map((week) => (
        <div
          key={week[0]?.getTime() ?? "week"}
          className={styles.dateStripWeek}
        >
          {week.map((day) => {
            const isSelected = isSameCalendarDay(day, selectedDate);
            const isToday = isSameCalendarDay(day, today);
            const isBeforeMin = isBeforeCalendarDay(day, earliestDate);
            const isAfterMax =
              maxDate !== undefined && isAfterCalendarDay(day, maxDate);
            const isUnavailable = isBeforeMin || isAfterMax;
            const isPast = isBeforeCalendarDay(day, today);
            const dayNum = String(day.getDate());
            const wk = formatWeekdayShort(locale, day).toUpperCase();
            const weekdayClass = `${SCHEDULE_WEEKDAY_LABEL} ${isSelected ? SCHEDULE_WEEKDAY_LABEL_ACTIVE : ""}`;
            const chipClass = isPast
              ? SCHEDULE_DATE_CHIP_PAST
              : isToday
                ? SCHEDULE_DATE_CHIP_TODAY
                : isSelected
                  ? SCHEDULE_DATE_CHIP_SELECTED
                  : SCHEDULE_DATE_CHIP_IDLE;

            if (isUnavailable) {
              return (
                <div
                  key={day.getTime()}
                  aria-hidden
                  className="flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl py-1 opacity-45"
                >
                  <span className={weekdayClass}>{wk}</span>
                  <span className={chipClass}>{dayNum}</span>
                </div>
              );
            }

            return (
              <button
                key={day.getTime()}
                type="button"
                onClick={() => onSelectDay(startOfLocalDay(day))}
                className={`flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#97907c]/30 ${isPast ? "opacity-55" : ""}`}
              >
                <span className={weekdayClass}>{wk}</span>
                <span className={chipClass}>{dayNum}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
