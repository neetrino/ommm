"use client";

import { AdminScheduleSessionSheetCard } from "@/components/admin/admin-schedule-session-sheet-card";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-session.types";
import { InternalScheduleMonthView } from "@/components/shared/schedule/internal-schedule-month-view";
import { ADMIN_SCHEDULE_BULK_BUSY_ID } from "@/components/admin/use-admin-schedule-management-actions";

type AdminScheduleMonthPanelProps = {
  locale: string;
  rows: AdminScheduleSession[];
  visibleYearMonth: string;
  onShiftVisibleMonth: (deltaMonths: number) => void;
  busyId: string | null;
  onDetails: (row: AdminScheduleSession) => void;
  onCancel?: (row: AdminScheduleSession) => void;
  onActivate?: (row: AdminScheduleSession) => void;
  onDelete?: (row: AdminScheduleSession) => void;
  onDuplicate?: (row: AdminScheduleSession) => void;
};

/** Admin month calendar — same grid as the public schedule, day sheet for sessions. */
export function AdminScheduleMonthPanel({
  locale,
  rows,
  visibleYearMonth,
  onShiftVisibleMonth,
  busyId,
  onDetails,
  onCancel,
  onActivate,
  onDelete,
  onDuplicate,
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
            busy={busyId === row.id || busyId === ADMIN_SCHEDULE_BULK_BUSY_ID}
            onDetails={onDetails}
            onDuplicate={onDuplicate}
            onCancel={onCancel}
            onActivate={onActivate}
            onDelete={onDelete}
          />
        ))
      }
    />
  );
}
