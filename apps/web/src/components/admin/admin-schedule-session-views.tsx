"use client";

import { useTranslations } from "next-intl";
import { AdminScheduleDateStrip } from "@/components/admin/admin-schedule-date-strip";
import { AdminScheduleSessionCompactRow } from "@/components/admin/admin-schedule-session-compact-row";
import { AdminScheduleSessionsListHeader } from "@/components/admin/admin-schedule-sessions-list-header";
import {
  ADMIN_SCHEDULE_SESSIONS_LIST_HEADER_CLASS,
  ADMIN_SCHEDULE_SESSIONS_LIST_TABLE_CLASS,
} from "@/components/admin/admin-schedule-sessions-list-layout";
import type { ScheduleView } from "@/components/admin/admin-schedule-view";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-session.types";
import { adminChrome } from "@/components/admin/admin-chrome";
import { ScheduleWeekColumnsView } from "@/components/shared/schedule/schedule-week-columns-view";
import { scheduleSessionLocalIsoDay } from "@/lib/local-iso-date";
import { sortAdminSessionRows, type SessionSortOrder } from "@/lib/list-sort";

export type AdminScheduleSessionViewsProps = {
  locale: string;
  view: ScheduleView;
  rows: AdminScheduleSession[];
  sortOrder: SessionSortOrder;
  onDateTimeSort: () => void;
  selectedDay: string | null;
  busyId: string | null;
  onSelectDay: (day: string) => void;
  onDetails: (row: AdminScheduleSession) => void;
  onCancel: (row: AdminScheduleSession) => void;
  onActivate: (row: AdminScheduleSession) => void;
  onDelete: (row: AdminScheduleSession) => void;
  onDuplicate: (row: AdminScheduleSession) => void;
};

type SessionTableProps = Omit<AdminScheduleSessionViewsProps, "view">;

type ScheduleWeekPanelProps = Omit<AdminScheduleSessionViewsProps, "view" | "sortOrder" | "onDateTimeSort">;

export function ScheduleViews(props: AdminScheduleSessionViewsProps) {
  if (props.view === "weekly") {
    return <ScheduleWeekPanel {...props} />;
  }
  return (
    <div className="space-y-3">
      <AdminScheduleDateStrip
        locale={props.locale}
        rows={props.rows}
        selectedDay={props.selectedDay}
        onSelectDay={props.onSelectDay}
      />
      <SessionTable {...props} />
    </div>
  );
}

export function SessionTable(props: SessionTableProps) {
  const t = useTranslations("adminPages.classes");
  const rows = sortAdminSessionRows(
    props.selectedDay === null
      ? props.rows
      : props.rows.filter(
          (row) => scheduleSessionLocalIsoDay(row.startsAt) === props.selectedDay,
        ),
    props.sortOrder,
  );
  if (rows.length === 0) {
    return (
      <div className={adminChrome.panel}>
        <p className="font-medium text-sage-900">{t("empty.filteredTitle")}</p>
        <p className="mt-1 text-sm text-sage-600">{t("empty.filteredBody")}</p>
      </div>
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
