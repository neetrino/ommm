"use client";

import { useTranslations } from "next-intl";
import { AdminScheduleMonthCards } from "@/components/admin/admin-schedule-month-cards";
import type { ScheduleDateStripRow } from "@/components/admin/admin-schedule-date-strip";
import type { ScheduleView } from "@/components/admin/admin-schedule-view";
import { ScheduleWeekColumnsView } from "@/components/shared/schedule/schedule-week-columns-view";
import { StaffScheduleSessionsTable } from "@/components/shared/schedule/staff-schedule-sessions-table";
import type { ScheduleSessionListRow } from "@/components/shared/schedule/schedule-session-list-types";

type StaffSchedulePreset = "staffReadOnly" | "staffWithCoach";

type StaffScheduleListWeekViewsProps = {
  locale: string;
  view: ScheduleView;
  rows: readonly ScheduleSessionListRow[];
  preset: StaffSchedulePreset;
  emptyTitle: string;
  emptyBody: string;
  showCoachInWeek?: boolean;
  dateStripRows?: readonly ScheduleDateStripRow[];
  dateStripTotalCount?: number;
  selectedStripDay?: string | null;
  onSelectStripDay?: (day: string) => void;
  onSelectAllStripDays?: () => void;
};

export function StaffScheduleListWeekViews({
  locale,
  view,
  rows,
  preset,
  emptyTitle,
  emptyBody,
  showCoachInWeek = false,
  dateStripRows,
  dateStripTotalCount,
  selectedStripDay = null,
  onSelectStripDay,
  onSelectAllStripDays,
}: StaffScheduleListWeekViewsProps) {
  const tSchedule = useTranslations("adminPages.schedule");

  if (view === "weekly") {
    return (
      <ScheduleWeekColumnsView
        locale={locale}
        rows={rows}
        showCoach={showCoachInWeek}
        labels={{
          gridAria: tSchedule("weekView.gridAria"),
          todayBadge: tSchedule("weekView.todayBadge"),
          emptyDay: tSchedule("weekView.emptyDay"),
        }}
      />
    );
  }

  if (
    view === "monthly" &&
    dateStripRows !== undefined &&
    onSelectStripDay !== undefined &&
    onSelectAllStripDays !== undefined
  ) {
    return (
      <AdminScheduleMonthCards
        locale={locale}
        rows={dateStripRows}
        totalSessionCount={dateStripTotalCount}
        selectedDay={selectedStripDay}
        onSelectDay={onSelectStripDay}
        onSelectAllDays={onSelectAllStripDays}
      />
    );
  }

  return (
    <StaffScheduleSessionsTable
      locale={locale}
      rows={rows}
      emptyTitle={emptyTitle}
      emptyBody={emptyBody}
      preset={preset}
    />
  );
}
