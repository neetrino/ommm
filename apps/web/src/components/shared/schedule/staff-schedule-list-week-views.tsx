"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminScheduleMonthNav } from "@/components/admin/admin-schedule-month-nav";
import { buildScheduleMonthDayKeys } from "@/components/admin/admin-schedule-month-utils";
import type { ScheduleView } from "@/components/admin/admin-schedule-view";
import {
  ScheduleWeekColumnsView,
  SCHEDULE_MONTH_COLUMN_MIN_WIDTH_PX,
} from "@/components/shared/schedule/schedule-week-columns-view";
import { StaffScheduleSessionsTable } from "@/components/shared/schedule/staff-schedule-sessions-table";
import type { ScheduleSessionListRow } from "@/components/shared/schedule/schedule-session-list-types";
import { scheduleTodayIsoDate } from "@/lib/local-iso-date";

type StaffSchedulePreset = "staffReadOnly" | "staffWithCoach";

type StaffScheduleListWeekViewsProps = {
  locale: string;
  view: ScheduleView;
  rows: readonly ScheduleSessionListRow[];
  preset: StaffSchedulePreset;
  emptyTitle: string;
  emptyBody: string;
  showCoachInWeek?: boolean;
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
  const monthDayKeys = useMemo(
    () => (visibleYearMonth ? buildScheduleMonthDayKeys(visibleYearMonth) : []),
    [visibleYearMonth],
  );

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
        <ScheduleWeekColumnsView
          locale={locale}
          rows={rows}
          dayKeys={monthDayKeys}
          showCoach={showCoachInWeek}
          expandColumns={false}
          fillRemainingViewport
          alignStartDayKey={scheduleTodayIsoDate()}
          columnMinWidth={SCHEDULE_MONTH_COLUMN_MIN_WIDTH_PX}
          labels={{
            gridAria: tSchedule("monthView.gridAria", { month: visibleYearMonth }),
            todayBadge: tSchedule("weekView.todayBadge"),
            emptyDay: tSchedule("weekView.emptyDay"),
          }}
        />
      </div>
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
