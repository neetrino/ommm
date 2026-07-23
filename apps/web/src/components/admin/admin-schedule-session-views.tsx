"use client";

import { useTranslations } from "next-intl";
import {
  AdminScheduleDateStrip,
  type ScheduleDateStripRow,
} from "@/components/admin/admin-schedule-date-strip";
import { AdminScheduleSessionCompactRow } from "@/components/admin/admin-schedule-session-compact-row";
import { AdminScheduleSessionsListHeader } from "@/components/admin/admin-schedule-sessions-list-header";
import {
  ADMIN_SCHEDULE_SESSIONS_LIST_HEADER_CLASS,
  ADMIN_SCHEDULE_SESSIONS_LIST_TABLE_CLASS,
} from "@/components/admin/admin-schedule-sessions-list-layout";
import type { ScheduleView } from "@/components/admin/admin-schedule-view";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-session.types";
import { AdminScheduleListEmptyState } from "@/components/admin/admin-schedule-list-empty-state";
import { ScheduleWeekColumnsView } from "@/components/shared/schedule/schedule-week-columns-view";
import { sortAdminSessionRows, type SessionSortOrder } from "@/lib/list-sort";

export type AdminScheduleSessionViewsProps = {
  locale: string;
  view: ScheduleView;
  rows: AdminScheduleSession[];
  /** Day-count source independent of the current list page. */
  dateStripRows: readonly ScheduleDateStripRow[];
  dateStripTotalCount?: number;
  selectedStripDay: string | null;
  onSelectStripDay: (day: string) => void;
  onSelectAllStripDays: () => void;
  sortOrder: SessionSortOrder;
  onDateTimeSort: () => void;
  busyId: string | null;
  onDetails: (row: AdminScheduleSession) => void;
  onCancel?: (row: AdminScheduleSession) => void;
  onActivate?: (row: AdminScheduleSession) => void;
  onDelete?: (row: AdminScheduleSession) => void;
  onDuplicate?: (row: AdminScheduleSession) => void;
};

type SessionTableProps = Omit<
  AdminScheduleSessionViewsProps,
  | "view"
  | "dateStripRows"
  | "dateStripTotalCount"
  | "onSelectStripDay"
  | "onSelectAllStripDays"
>;

type ScheduleWeekPanelProps = Omit<
  AdminScheduleSessionViewsProps,
  | "view"
  | "sortOrder"
  | "onDateTimeSort"
  | "dateStripRows"
  | "dateStripTotalCount"
  | "selectedStripDay"
  | "onSelectStripDay"
  | "onSelectAllStripDays"
>;

export function ScheduleViews(props: AdminScheduleSessionViewsProps) {
  if (props.view === "weekly") {
    return <ScheduleWeekPanel {...props} />;
  }
  return (
    <div className="space-y-3">
      <AdminScheduleDateStrip
        locale={props.locale}
        rows={props.dateStripRows}
        totalSessionCount={props.dateStripTotalCount}
        selectedDay={props.selectedStripDay}
        onSelectDay={props.onSelectStripDay}
        onSelectAllDays={props.onSelectAllStripDays}
      />
      <SessionTable {...props} />
    </div>
  );
}

export function SessionTable(props: SessionTableProps) {
  const rows = sortAdminSessionRows(props.rows, props.sortOrder);
  if (rows.length === 0) {
    return (
      <AdminScheduleListEmptyState
        variant={props.selectedStripDay !== null ? "selectedDay" : "filtered"}
      />
    );
  }
  return (
    <div className={ADMIN_SCHEDULE_SESSIONS_LIST_TABLE_CLASS}>
      <div className={ADMIN_SCHEDULE_SESSIONS_LIST_HEADER_CLASS}>
        <AdminScheduleSessionsListHeader
          sortOrder={props.sortOrder}
          onDateTimeSort={props.onDateTimeSort}
        />
      </div>
      {rows.map((row) => (
        <AdminScheduleSessionCompactRow
          key={row.id}
          row={row}
          locale={props.locale}
          busy={props.busyId === row.id}
          onDetails={props.onDetails}
          onDuplicate={props.onDuplicate}
          onCancel={props.onCancel}
          onActivate={props.onActivate}
          onDelete={props.onDelete}
        />
      ))}
    </div>
  );
}

export function ScheduleWeekPanel(props: ScheduleWeekPanelProps) {
  const tPage = useTranslations("adminPages.schedule");

  return (
    <ScheduleWeekColumnsView
      locale={props.locale}
      rows={props.rows}
      showCoach
      onSessionClick={props.onDetails}
      labels={{
        gridAria: tPage("weekView.gridAria"),
        todayBadge: tPage("weekView.todayBadge"),
        emptyDay: tPage("weekView.emptyDay"),
      }}
    />
  );
}
