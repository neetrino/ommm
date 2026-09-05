"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  calendarMonthDelta,
  dateFromYearMonth,
  yearMonthFromIsoDay,
} from "@/components/admin/admin-schedule-month-utils";
import {
  startOfLocalDay,
  startOfLocalMonth,
} from "@/components/marketing/schedule/schedule-date-utils";
import { ScheduleDaySessionsSheet } from "@/components/marketing/schedule/schedule-day-sessions-sheet";
import {
  ScheduleMonthCalendar,
  type ScheduleMonthCalendarLabels,
} from "@/components/shared/schedule/schedule-month-calendar";
import { groupScheduleSessionsByDay } from "@/components/shared/schedule/schedule-week-view-utils";
import { formatDateForUi } from "@/lib/date-display";
import { toLocalIsoDate } from "@/lib/local-iso-date";

function formatSheetDayLabel(locale: string, date: Date): string {
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
  return `${weekday}, ${formatDateForUi(date)}`;
}

function useInternalMonthCalendarLabels(): ScheduleMonthCalendarLabels {
  const t = useTranslations("adminPages.schedule");
  return {
    boardAria: t("monthView.boardAria"),
    prevMonthAria: t("monthView.previousMonth"),
    nextMonthAria: t("monthView.nextMonth"),
    todayBadge: t("weekView.todayBadge"),
    classCount: (count) => t("monthView.dayClassCount", { count }),
    dayAria: (day) => t("monthView.dayAria", { day }),
    dayAriaWithCount: (day, count) => t("monthView.dayAriaWithCount", { day, count }),
  };
}

type InternalScheduleMonthViewProps<T extends { startsAt: string }> = {
  locale: string;
  rows: readonly T[];
  visibleYearMonth?: string;
  onShiftVisibleMonth?: (deltaMonths: number) => void;
  renderDaySessions: (dayRows: readonly T[]) => ReactNode;
};

/** Internal month grid + day sheet, sharing the public calendar component. */
export function InternalScheduleMonthView<T extends { startsAt: string }>({
  locale,
  rows,
  visibleYearMonth,
  onShiftVisibleMonth,
  renderDaySessions,
}: InternalScheduleMonthViewProps<T>) {
  const t = useTranslations("adminPages.schedule");
  const labels = useInternalMonthCalendarLabels();
  const today = startOfLocalDay(new Date());
  const controlledMonth =
    visibleYearMonth !== undefined
      ? startOfLocalMonth(dateFromYearMonth(visibleYearMonth))
      : null;
  const [localMonth, setLocalMonth] = useState(
    () => controlledMonth ?? startOfLocalMonth(today),
  );
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const grouped = useMemo(() => groupScheduleSessionsByDay(rows), [rows]);
  const sessionCountByDayKey = useMemo(() => {
    const counts = new Map<string, number>();
    for (const [key, dayRows] of grouped) {
      counts.set(key, dayRows.length);
    }
    return counts;
  }, [grouped]);

  const visibleMonth = controlledMonth ?? localMonth;
  const selectedDate = selectedDay ?? today;
  const selectedDayKey = selectedDay !== null ? toLocalIsoDate(selectedDay) : null;
  const selectedRows = selectedDayKey === null ? [] : (grouped.get(selectedDayKey) ?? []);

  return (
    <>
      <ScheduleMonthCalendar
        locale={locale}
        selectedDate={selectedDate}
        daySheetOpen={selectedDay !== null}
        sessionCountByDayKey={sessionCountByDayKey}
        visibleMonth={visibleMonth}
        labels={labels}
        dimPastDays
        onVisibleMonthChange={(month) => {
          if (visibleYearMonth !== undefined && onShiftVisibleMonth !== undefined) {
            const nextYm = yearMonthFromIsoDay(toLocalIsoDate(month));
            const delta = calendarMonthDelta(visibleYearMonth, nextYm);
            if (delta !== 0) onShiftVisibleMonth(delta);
            return;
          }
          setLocalMonth(startOfLocalMonth(month));
        }}
        onSelectDay={setSelectedDay}
      />
      <ScheduleDaySessionsSheet
        open={selectedDay !== null}
        dayLabel={formatSheetDayLabel(locale, selectedDate)}
        copy={{
          aria: t("monthView.daySheetAria"),
          closeAria: t("monthView.daySheetCloseAria"),
          eyebrow: t("monthView.daySheetEyebrow"),
        }}
        onClose={() => setSelectedDay(null)}
      >
        {selectedRows.length === 0 ? (
          <p className="py-10 text-center text-sm font-medium text-sage-600">
            {t("monthView.emptyDay")}
          </p>
        ) : (
          <div className="flex flex-col gap-3">{renderDaySessions(selectedRows)}</div>
        )}
      </ScheduleDaySessionsSheet>
    </>
  );
}
