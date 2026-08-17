"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  AdminScheduleDateStrip,
  type ScheduleDateStripRow,
} from "@/components/admin/admin-schedule-date-strip";
import { AdminScheduleMonthNav } from "@/components/admin/admin-schedule-month-nav";
import {
  buildScheduleMonthDayKeys,
  formatMonthTitle,
  yearMonthFromIsoDay,
} from "@/components/admin/admin-schedule-month-utils";
import { AdminScheduleSessionCompactRow } from "@/components/admin/admin-schedule-session-compact-row";
import { AdminScheduleSessionsBulkBar } from "@/components/admin/admin-schedule-sessions-bulk-bar";
import { AdminScheduleSessionsListHeader } from "@/components/admin/admin-schedule-sessions-list-header";
import {
  ADMIN_SCHEDULE_SESSIONS_LIST_HEADER_CLASS,
  ADMIN_SCHEDULE_SESSIONS_LIST_TABLE_CLASS,
} from "@/components/admin/admin-schedule-sessions-list-layout";
import type { ScheduleView } from "@/components/admin/admin-schedule-view";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-session.types";
import { AdminScheduleListEmptyState } from "@/components/admin/admin-schedule-list-empty-state";
import { ADMIN_SCHEDULE_BULK_BUSY_ID } from "@/components/admin/use-admin-schedule-management-actions";
import {
  ScheduleWeekColumnsView,
  SCHEDULE_MONTH_COLUMN_MIN_WIDTH_PX,
} from "@/components/shared/schedule/schedule-week-columns-view";
import { sortAdminSessionRows, type SessionSortOrder } from "@/lib/list-sort";
import { scheduleTodayIsoDate } from "@/lib/local-iso-date";

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
  /** Visible month (`YYYY-MM`) for monthly list chrome. */
  visibleYearMonth?: string;
  onPreviousMonth?: () => void;
  onNextMonth?: () => void;
  sortOrder: SessionSortOrder;
  onDateTimeSort: () => void;
  busyId: string | null;
  onDetails: (row: AdminScheduleSession) => void;
  onCancel?: (row: AdminScheduleSession) => void;
  onActivate?: (row: AdminScheduleSession) => void;
  onDelete?: (row: AdminScheduleSession) => void;
  onDuplicate?: (row: AdminScheduleSession) => void;
  selectionEnabled?: boolean;
  selectedIds?: ReadonlySet<string>;
  onToggleSelect?: (rowId: string, selected: boolean) => void;
  onToggleSelectAll?: (checked: boolean) => void;
  onBulkCancel?: () => void;
  onBulkActivate?: () => void;
};

type SessionTableProps = Omit<
  AdminScheduleSessionViewsProps,
  | "view"
  | "dateStripRows"
  | "dateStripTotalCount"
  | "onSelectStripDay"
  | "onSelectAllStripDays"
  | "visibleYearMonth"
  | "onPreviousMonth"
  | "onNextMonth"
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
  | "visibleYearMonth"
  | "onPreviousMonth"
  | "onNextMonth"
  | "selectionEnabled"
  | "selectedIds"
  | "onToggleSelect"
  | "onToggleSelectAll"
  | "onBulkCancel"
  | "onBulkActivate"
>;

export function ScheduleViews(props: AdminScheduleSessionViewsProps) {
  if (props.view === "weekly") {
    return <ScheduleWeekPanel {...props} />;
  }

  if (props.view === "monthly") {
    return <ScheduleMonthPanel {...props} />;
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

  const selectionEnabled = props.selectionEnabled === true;
  const selectedIds = props.selectedIds ?? new Set<string>();
  const selectedVisible = rows.filter((row) => selectedIds.has(row.id));
  const allSelected = rows.length > 0 && selectedVisible.length === rows.length;
  const someSelected = selectedVisible.length > 0;
  const cancellableCount = selectedVisible.filter((row) => row.status !== "CANCELLED").length;
  const activatableCount = selectedVisible.filter((row) => row.status === "CANCELLED").length;
  const busy = props.busyId !== null;

  return (
    <div className="space-y-3">
      <div className={ADMIN_SCHEDULE_SESSIONS_LIST_TABLE_CLASS}>
        <div className={ADMIN_SCHEDULE_SESSIONS_LIST_HEADER_CLASS}>
          <AdminScheduleSessionsListHeader
            sortOrder={props.sortOrder}
            onDateTimeSort={props.onDateTimeSort}
            selectionEnabled={selectionEnabled}
            allSelected={allSelected}
            someSelected={someSelected}
            onToggleSelectAll={props.onToggleSelectAll}
            selectAllDisabled={busy}
          />
        </div>
        {rows.map((row) => (
          <AdminScheduleSessionCompactRow
            key={row.id}
            row={row}
            locale={props.locale}
            busy={props.busyId === row.id || props.busyId === ADMIN_SCHEDULE_BULK_BUSY_ID}
            selected={selectedIds.has(row.id)}
            selectionEnabled={selectionEnabled}
            onToggleSelect={props.onToggleSelect}
            onDetails={props.onDetails}
            onDuplicate={props.onDuplicate}
            onCancel={props.onCancel}
            onActivate={props.onActivate}
            onDelete={props.onDelete}
          />
        ))}
      </div>
      {selectionEnabled ? (
        <AdminScheduleSessionsBulkBar
          selectedCount={selectedVisible.length}
          cancellableCount={cancellableCount}
          activatableCount={activatableCount}
          busy={busy}
          onBulkCancel={props.onBulkCancel}
          onBulkActivate={props.onBulkActivate}
        />
      ) : null}
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

type ScheduleMonthPanelProps = Pick<
  AdminScheduleSessionViewsProps,
  | "locale"
  | "rows"
  | "visibleYearMonth"
  | "onPreviousMonth"
  | "onNextMonth"
  | "onDetails"
>;

function ScheduleMonthPanel({
  locale,
  rows,
  visibleYearMonth,
  onPreviousMonth,
  onNextMonth,
  onDetails,
}: ScheduleMonthPanelProps) {
  const tPage = useTranslations("adminPages.schedule");
  const yearMonth = visibleYearMonth ?? yearMonthFromIsoDay(scheduleTodayIsoDate());
  const dayKeys = useMemo(() => buildScheduleMonthDayKeys(yearMonth), [yearMonth]);
  const monthTitle = useMemo(() => formatMonthTitle(locale, yearMonth), [locale, yearMonth]);

  return (
    <div className="space-y-3">
      {onPreviousMonth && onNextMonth ? (
        <AdminScheduleMonthNav
          locale={locale}
          yearMonth={yearMonth}
          onPreviousMonth={onPreviousMonth}
          onNextMonth={onNextMonth}
        />
      ) : null}
      <ScheduleWeekColumnsView
        locale={locale}
        rows={rows}
        dayKeys={dayKeys}
        showCoach
        expandColumns={false}
        fillRemainingViewport
        alignStartDayKey={scheduleTodayIsoDate()}
        columnMinWidth={SCHEDULE_MONTH_COLUMN_MIN_WIDTH_PX}
        onSessionClick={onDetails}
        labels={{
          gridAria: tPage("monthView.gridAria", { month: monthTitle }),
          todayBadge: tPage("weekView.todayBadge"),
          emptyDay: tPage("weekView.emptyDay"),
        }}
      />
    </div>
  );
}
