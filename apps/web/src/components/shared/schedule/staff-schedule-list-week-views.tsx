"use client";

import { useTranslations } from "next-intl";
import type { ScheduleView } from "@/components/admin/admin-schedule-view";
import { InternalScheduleMonthView } from "@/components/shared/schedule/internal-schedule-month-view";
import { ScheduleWeekColumnsView } from "@/components/shared/schedule/schedule-week-columns-view";
import { ScheduleWeekSessionMiniCard } from "@/components/shared/schedule/schedule-week-session-mini-card";
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
  onShiftVisibleMonth?: (deltaMonths: number) => void;
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
  onShiftVisibleMonth,
}: StaffScheduleListWeekViewsProps) {
  const tSchedule = useTranslations("adminPages.schedule");
  const canAddVisitor = preset !== "staffReadOnly";

  if (view === "weekly") {
    return (
      <ScheduleWeekColumnsView
        locale={locale}
        rows={rows}
        showCoach={showCoachInWeek}
        expandColumns={false}
        alignStartDayKey={scheduleTodayIsoDate()}
        canAddVisitor={canAddVisitor}
        labels={{
          gridAria: tSchedule("weekView.gridAria"),
          todayBadge: tSchedule("weekView.todayBadge"),
          emptyDay: tSchedule("weekView.emptyDay"),
        }}
      />
    );
  }

  if (view === "monthly") {
    return (
      <InternalScheduleMonthView
        locale={locale}
        rows={rows}
        visibleYearMonth={visibleYearMonth}
        onShiftVisibleMonth={onShiftVisibleMonth}
        renderDaySessions={(dayRows) =>
          dayRows.map((session) => (
            <ScheduleWeekSessionMiniCard
              key={session.id}
              locale={locale}
              session={session}
              showCoach={showCoachInWeek}
              variant="staff"
              canAddVisitor={canAddVisitor}
            />
          ))
        }
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
