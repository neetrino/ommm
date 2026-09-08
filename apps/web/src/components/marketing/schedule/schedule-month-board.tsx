"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useVisibleMonthFollow } from "@/components/marketing/schedule/use-visible-month-follow";
import styles from "@/components/marketing/schedule/schedule-month-board.module.css";
import { ScheduleMonthCalendar } from "@/components/shared/schedule/schedule-month-calendar";

type ScheduleMonthBoardProps = {
  locale: string;
  selectedDate: Date;
  minDate: Date;
  maxDate: Date;
  daySheetOpen: boolean;
  sessionCountByDayKey: ReadonlyMap<string, number>;
  filtersSlot?: ReactNode;
  onSelectDay: (day: Date) => void;
};

/** Desktop month layout — day cards with class counts; selection opens the sheet. */
export function ScheduleMonthBoard({
  locale,
  selectedDate,
  minDate,
  maxDate,
  daySheetOpen,
  sessionCountByDayKey,
  filtersSlot,
  onSelectDay,
}: ScheduleMonthBoardProps) {
  const t = useTranslations("marketingPages.schedule");
  const [visibleMonth, setVisibleMonth] = useVisibleMonthFollow(selectedDate);

  return (
    <div className={styles.board} aria-label={t("monthBoardAria")}>
      {filtersSlot}

      <ScheduleMonthCalendar
        locale={locale}
        selectedDate={selectedDate}
        daySheetOpen={daySheetOpen}
        minDate={minDate}
        maxDate={maxDate}
        sessionCountByDayKey={sessionCountByDayKey}
        visibleMonth={visibleMonth}
        onVisibleMonthChange={setVisibleMonth}
        onSelectDay={onSelectDay}
        labels={{
          boardAria: t("monthBoardAria"),
          prevMonthAria: t("calendarPrevMonthAria"),
          nextMonthAria: t("calendarNextMonthAria"),
          todayBadge: t("todayBadge"),
          classCount: (count) => t("monthDayClassCount", { count }),
          dayAria: (day) => t("monthDayAria", { day }),
          dayAriaWithCount: (day, count) => t("monthDayAriaWithCount", { day, count }),
        }}
      />
    </div>
  );
}
