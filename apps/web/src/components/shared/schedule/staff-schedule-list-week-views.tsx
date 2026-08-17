"use client";

import { useTranslations } from "next-intl";
import { AdminScheduleMonthNav } from "@/components/admin/admin-schedule-month-nav";
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
  visibleYearMonth?: string;
  onPreviousMonth?: () => void;
  onNextMonth?: () => void;
};

export function StaffScheduleListWeekViews({
  locale,
  view,
  rows,
  preset,
  emptyTitle,
  emptyBody,
  showCoachInWeek = false,
  visibleYearMonth,
  onPreviousMonth,
  onNextMonth,
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

  const table = (
    <StaffScheduleSessionsTable
      locale={locale}
      rows={rows}
      emptyTitle={emptyTitle}
      emptyBody={emptyBody}
      preset={preset}
    />
  );

  if (
    view === "monthly" &&
    visibleYearMonth !== undefined &&
    onPreviousMonth !== undefined &&
    onNextMonth !== undefined
  ) {
    return (
      <div className="space-y-3">
        <AdminScheduleMonthNav
          locale={locale}
          yearMonth={visibleYearMonth}
          onPreviousMonth={onPreviousMonth}
          onNextMonth={onNextMonth}
        />
        {table}
      </div>
    );
  }

  return table;
}
