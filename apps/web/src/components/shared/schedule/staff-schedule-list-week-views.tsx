"use client";

import { useTranslations } from "next-intl";
import { ScheduleWeekColumnsView } from "@/components/shared/schedule/schedule-week-columns-view";
import { StaffScheduleSessionsTable } from "@/components/shared/schedule/staff-schedule-sessions-table";
import type { ScheduleSessionListRow } from "@/components/shared/schedule/schedule-session-list-types";
import type { ScheduleView } from "@/components/admin/admin-schedule-view";

type StaffSchedulePreset = "staffReadOnly" | "staffWithCoach";

type StaffScheduleListWeekViewsProps = {
  locale: string;
  view: ScheduleView;
  rows: readonly ScheduleSessionListRow[];
  preset: StaffSchedulePreset;
  emptyTitle: string;
  emptyBody: string;
  showCoachInWeek?: boolean;
};

export function StaffScheduleListWeekViews({
  locale,
  view,
  rows,
  preset,
  emptyTitle,
  emptyBody,
  showCoachInWeek = false,
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
