"use client";

import { useMemo } from "react";
import { useScheduleWeekBoardScroll } from "@/components/shared/schedule/schedule-week-board-scroll";
import {
  ScheduleWeekSessionMiniCard,
  type ScheduleWeekCardVariant,
  type ScheduleWeekMiniCardSession,
} from "@/components/shared/schedule/schedule-week-session-mini-card";
import {
  SCHEDULE_MONTH_BOARD_MIN_HEIGHT_CLASS,
  SCHEDULE_MONTH_COLUMN_MIN_WIDTH_PX,
  SCHEDULE_WEEK_COLUMN_GAP_CLASS,
  SCHEDULE_WEEK_COLUMN_MIN_WIDTH_PX,
  SCHEDULE_WEEK_HORIZONTAL_SCROLL_CLASS,
} from "@/components/shared/schedule/schedule-week-view-tokens";
import {
  buildScheduleWeekDayKeys,
  groupScheduleSessionsByDay,
  isScheduleWeekToday,
  scheduleWeekTrackMinWidthPx,
} from "@/components/shared/schedule/schedule-week-view-utils";

export type ScheduleWeekViewLabels = {
  gridAria: string;
  todayBadge: string;
  emptyDay: string;
};

type ScheduleWeekColumnsViewProps<T extends ScheduleWeekMiniCardSession> = {
  locale: string;
  rows: readonly T[];
  labels: ScheduleWeekViewLabels;
  showCoach?: boolean;
  cardVariant?: ScheduleWeekCardVariant;
  /** Override day columns (e.g. full month). Defaults to rolling week. */
  dayKeys?: readonly string[];
  columnMinWidth?: number;
  /**
   * When true, columns flex to fill the track (week).
   * When false, columns keep a fixed min width for horizontal month scrolling.
   */
  expandColumns?: boolean;
  /** Stretch columns to remaining viewport height (month board). */
  fillRemainingViewport?: boolean;
  onSessionClick?: (session: T) => void;
};

/**
 * Kanban-style day columns — week fills width when possible;
 * month passes fixed day keys and scrolls horizontally.
 */
export function ScheduleWeekColumnsView<T extends ScheduleWeekMiniCardSession>({
  locale,
  rows,
  labels,
  showCoach = false,
  cardVariant = "staff",
  dayKeys: dayKeysProp,
  columnMinWidth = SCHEDULE_WEEK_COLUMN_MIN_WIDTH_PX,
  expandColumns = true,
  fillRemainingViewport = false,
  onSessionClick,
}: ScheduleWeekColumnsViewProps<T>) {
  const fallbackWeekKeys = useMemo(() => buildScheduleWeekDayKeys(), []);
  const dayKeys = dayKeysProp ?? fallbackWeekKeys;
  const grouped = useMemo(() => groupScheduleSessionsByDay(rows), [rows]);
  const trackMinWidthPx = scheduleWeekTrackMinWidthPx(dayKeys.length, columnMinWidth);
  const { scrollRef, renderEdgeZones } = useScheduleWeekBoardScroll(trackMinWidthPx);

  const boardHeightClass = fillRemainingViewport ? SCHEDULE_MONTH_BOARD_MIN_HEIGHT_CLASS : "";
  const columnStretchClass = fillRemainingViewport ? "h-full" : "";
  const sessionsAreaClass = fillRemainingViewport
    ? "flex min-h-0 flex-1 flex-col gap-3 pb-6"
    : "flex flex-col gap-3 pb-6";
  const emptyDayClass = fillRemainingViewport
    ? "flex flex-1 items-center justify-center rounded-[28px] border border-dashed border-white/80 bg-white/55 px-3 py-8 text-center text-xs font-medium leading-snug text-sage-500"
    : "rounded-[28px] border border-dashed border-white/80 bg-white/55 px-3 py-8 text-center text-xs font-medium leading-snug text-sage-500";

  return (
    <div className={`relative ${boardHeightClass}`.trim()}>
      {renderEdgeZones()}
      <div
        ref={scrollRef}
        className={`${SCHEDULE_WEEK_HORIZONTAL_SCROLL_CLASS} ${fillRemainingViewport ? "h-full" : ""}`.trim()}
        aria-label={labels.gridAria}
      >
        <div
          className={`flex ${fillRemainingViewport ? "h-full items-stretch" : "items-start"} ${SCHEDULE_WEEK_COLUMN_GAP_CLASS} ${expandColumns ? "w-full" : ""}`}
          style={{ minWidth: `${trackMinWidthPx}px` }}
        >
          {dayKeys.map((dayKey) => {
            const daySessions = grouped.get(dayKey) ?? [];
            const isToday = isScheduleWeekToday(dayKey);
            const date = new Date(`${dayKey}T00:00:00`);

            return (
              <div
                key={dayKey}
                className={
                  expandColumns
                    ? `flex min-w-0 flex-1 flex-col ${columnStretchClass}`
                    : `flex shrink-0 flex-col ${columnStretchClass}`
                }
                style={{
                  width: expandColumns ? undefined : columnMinWidth,
                  minWidth: columnMinWidth,
                }}
              >
                <div className="mb-3 shrink-0">
                  <div
                    className={`flex items-start justify-between gap-2 rounded-[20px] px-3 py-2.5 ${
                      isToday
                        ? "bg-sage-800 text-white shadow-[0_14px_28px_-20px_rgba(45,40,35,0.55)]"
                        : "bg-white/65 text-sage-900"
                    }`}
                  >
                    <div>
                      <span
                        className={`block text-[10px] font-semibold uppercase tracking-[0.12em] ${
                          isToday ? "text-white/70" : "text-sage-500"
                        }`}
                      >
                        {new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date)}
                      </span>
                      <span
                        className={`mt-1 block text-lg font-semibold tabular-nums ${
                          isToday ? "text-white" : "text-sage-900"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {isToday ? (
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
                          {labels.todayBadge}
                        </span>
                      ) : null}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          isToday ? "bg-white/20 text-white" : "bg-sand-50 text-sage-700"
                        }`}
                      >
                        {daySessions.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={sessionsAreaClass}>
                  {daySessions.length === 0 ? (
                    <div className={emptyDayClass}>{labels.emptyDay}</div>
                  ) : (
                    daySessions.map((session) => (
                      <ScheduleWeekSessionMiniCard
                        key={session.id}
                        locale={locale}
                        session={session}
                        showCoach={showCoach}
                        variant={cardVariant}
                        onClick={onSessionClick ? () => onSessionClick(session) : undefined}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { SCHEDULE_MONTH_COLUMN_MIN_WIDTH_PX };
