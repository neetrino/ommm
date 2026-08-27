"use client";

import { ScheduleSessionCardFields } from "@/components/admin/admin-schedule-session-compact-row-fields";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-management";
import { ADMIN_SCHEDULE_SESSIONS_LIST_ROW_CLASS } from "@/components/admin/admin-schedule-sessions-list-layout";
import { SCHEDULE_PAST_LIST_ROW_CLASS } from "@/components/shared/schedule/schedule-week-view-tokens";
import { isScheduleSessionOnPastDay } from "@/components/shared/schedule/schedule-week-view-utils";
import { scheduleTodayIsoDate } from "@/lib/local-iso-date";

type AdminScheduleSessionCompactRowProps = {
  row: AdminScheduleSession;
  locale: string;
  busy: boolean;
  selected?: boolean;
  selectionEnabled?: boolean;
  onToggleSelect?: (rowId: string, selected: boolean) => void;
  onDetails: (row: AdminScheduleSession) => void;
  onDuplicate?: (row: AdminScheduleSession) => void;
  onCancel?: (row: AdminScheduleSession) => void;
  onActivate?: (row: AdminScheduleSession) => void;
  onDelete?: (row: AdminScheduleSession) => void;
};

export function AdminScheduleSessionCompactRow({
  row,
  locale,
  busy,
  selected = false,
  selectionEnabled = false,
  onToggleSelect,
  onDetails,
  onDuplicate,
  onCancel,
  onActivate,
  onDelete,
}: AdminScheduleSessionCompactRowProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={row.title}
      onClick={() => onDetails(row)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onDetails(row);
        }
      }}
      className={`${ADMIN_SCHEDULE_SESSIONS_LIST_ROW_CLASS} ${
        isScheduleSessionOnPastDay(row.startsAt, scheduleTodayIsoDate())
          ? SCHEDULE_PAST_LIST_ROW_CLASS
          : ""
      }`.trim()}
    >
      <ScheduleSessionCardFields
        row={row}
        locale={locale}
        busy={busy}
        selected={selected}
        selectionEnabled={selectionEnabled}
        onToggleSelect={onToggleSelect}
        onDuplicate={onDuplicate}
        onCancel={onCancel}
        onActivate={onActivate}
        onDelete={onDelete}
      />
    </article>
  );
}
