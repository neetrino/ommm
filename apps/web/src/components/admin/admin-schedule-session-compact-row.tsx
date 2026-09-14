"use client";

import { useTranslations } from "next-intl";
import { ScheduleSessionCardFields } from "@/components/admin/admin-schedule-session-compact-row-fields";
import { AdminScheduleSessionSheetCard } from "@/components/admin/admin-schedule-session-sheet-card";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-management";
import { hasAdminScheduleSessionRowActions } from "@/components/admin/admin-schedule-session.helpers";
import {
  ADMIN_SCHEDULE_SESSIONS_LIST_ROW_CLASS,
  ADMIN_SCHEDULE_SESSIONS_LIST_ROW_NO_ACTIONS_CLASS,
} from "@/components/admin/admin-schedule-sessions-list-layout";
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
  canAddVisitor?: boolean;
  showCoach?: boolean;
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
  canAddVisitor = true,
  showCoach = true,
}: AdminScheduleSessionCompactRowProps) {
  const t = useTranslations("adminPages.classes");
  const showActions = hasAdminScheduleSessionRowActions({
    onDuplicate,
    onCancel,
    onActivate,
    onDelete,
  });
  const pastDayClass = isScheduleSessionOnPastDay(row.startsAt, scheduleTodayIsoDate())
    ? SCHEDULE_PAST_LIST_ROW_CLASS
    : "";
  const select =
    selectionEnabled && onToggleSelect !== undefined
      ? {
          checked: selected,
          disabled: busy,
          ariaLabel: t("bulk.selectRowAria", { title: row.title }),
          onChange: (next: boolean) => onToggleSelect(row.id, next),
        }
      : null;

  return (
    <>
      <div className="md:hidden">
        <AdminScheduleSessionSheetCard
          row={row}
          locale={locale}
          onDetails={onDetails}
          canAddVisitor={canAddVisitor}
          showCoach={showCoach}
          select={select}
        />
      </div>
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
        className={`max-md:hidden ${ADMIN_SCHEDULE_SESSIONS_LIST_ROW_CLASS} ${
          showActions ? "" : ADMIN_SCHEDULE_SESSIONS_LIST_ROW_NO_ACTIONS_CLASS
        } ${pastDayClass}`.trim()}
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
          canAddVisitor={canAddVisitor}
          showCoach={showCoach}
        />
      </article>
    </>
  );
}
