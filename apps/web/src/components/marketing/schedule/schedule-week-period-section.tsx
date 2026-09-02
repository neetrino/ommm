"use client";

import type { CSSProperties, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChevronDownIcon } from "@/components/marketing/schedule/schedule-view-icons";
import styles from "@/components/marketing/schedule/schedule-week-board.module.css";
import {
  resolvePeriodMaxSessionRows,
  type DayPeriod,
  type ScheduleWeekColumn,
} from "@/components/marketing/schedule/schedule-week-board-helpers";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { isBeforeCalendarDay } from "@/components/marketing/schedule/schedule-date-utils";

type ScheduleWeekPeriodSectionProps = {
  period: DayPeriod;
  collapsed: boolean;
  columns: readonly ScheduleWeekColumn[];
  today: Date;
  sessionsByDayAndPeriod: ReadonlyMap<string, readonly MarketingScheduleItem[]>;
  onToggle: () => void;
  renderSessionCard: (row: MarketingScheduleItem, isPastDay: boolean) => ReactNode;
};

function periodLabelKey(period: DayPeriod): "periodMorning" | "periodAfternoon" | "periodEvening" {
  if (period === "morning") return "periodMorning";
  if (period === "afternoon") return "periodAfternoon";
  return "periodEvening";
}

/** Collapsible Morning / Afternoon / Evening row for the desktop week board. */
export function ScheduleWeekPeriodSection({
  period,
  collapsed,
  columns,
  today,
  sessionsByDayAndPeriod,
  onToggle,
  renderSessionCard,
}: ScheduleWeekPeriodSectionProps) {
  const t = useTranslations("marketingPages.schedule");
  const maxSessionRows = resolvePeriodMaxSessionRows(
    columns,
    period,
    sessionsByDayAndPeriod,
  );
  const trackStyle = {
    "--period-session-rows": maxSessionRows,
  } as CSSProperties;

  return (
    <section className={styles.periodBlock}>
      <button
        type="button"
        className={styles.periodTitle}
        aria-expanded={!collapsed}
        onClick={onToggle}
      >
        <span
          className={[
            styles.periodChevron,
            collapsed ? styles.periodChevronCollapsed : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        >
          <ChevronDownIcon />
        </span>
        {t(periodLabelKey(period))}
      </button>
      {collapsed ? null : (
        <div className={styles.periodTrack} style={trackStyle}>
          {columns.map((column) => {
            const isPastDay = isBeforeCalendarDay(column.day, today);
            const daySessions =
              sessionsByDayAndPeriod.get(`${column.dayKey}:${period}`) ?? [];

            return (
              <div key={column.dayKey} className={styles.column}>
                <ul className={styles.sessions}>
                  {daySessions.map((row) => (
                    <li key={row.id}>{renderSessionCard(row, isPastDay)}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
