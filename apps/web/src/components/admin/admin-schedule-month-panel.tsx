"use client";

import { AdminScheduleSessionSheetCard } from "@/components/admin/admin-schedule-session-sheet-card";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-session.types";
import { InternalScheduleMonthView } from "@/components/shared/schedule/internal-schedule-month-view";

type AdminScheduleMonthPanelProps = {
  locale: string;
  rows: AdminScheduleSession[];
  visibleYearMonth: string;
  onShiftVisibleMonth: (deltaMonths: number) => void;
  onDetails: (row: AdminScheduleSession) => void;
  canAddVisitor?: boolean;
  showCoach?: boolean;
};

/** Admin month calendar — same grid as the public schedule, day sheet for sessions. */
export function AdminScheduleMonthPanel({
  locale,
  rows,
  visibleYearMonth,
  onShiftVisibleMonth,
  onDetails,
  canAddVisitor = true,
  showCoach = true,
}: AdminScheduleMonthPanelProps) {
  return (
    <InternalScheduleMonthView
      locale={locale}
      rows={rows}
      visibleYearMonth={visibleYearMonth}
      onShiftVisibleMonth={onShiftVisibleMonth}
      renderDaySessions={(dayRows) =>
        dayRows.map((row) => (
          <AdminScheduleSessionSheetCard
            key={row.id}
            row={row}
            locale={locale}
            onDetails={onDetails}
            canAddVisitor={canAddVisitor}
            showCoach={showCoach}
          />
        ))
      }
    />
  );
}
