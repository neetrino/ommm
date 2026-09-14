"use client";

import { useCallback, useMemo, useState } from "react";
import {
  addCalendarMonths,
  yearMonthFromIsoDay,
} from "@/components/admin/admin-schedule-month-utils";
import { AdminSessionRegistrationsModal } from "@/components/admin/admin-session-registrations-modal";
import { ScheduleViews } from "@/components/admin/admin-schedule-session-views";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-session.types";
import type { ScheduleView } from "@/components/admin/admin-schedule-view";
import type { ScheduleSessionListRow } from "@/components/shared/schedule/schedule-session-list-types";
import { mapListRowToAdminScheduleSession } from "@/lib/map-admin-session-to-list-row";
import { toggleSessionDateSortOrder, type SessionSortOrder } from "@/lib/list-sort";
import {
  scheduleSessionLocalIsoDay,
  scheduleTodayIsoDate,
} from "@/lib/local-iso-date";

type CoachScheduleViewsProps = {
  locale: string;
  view: ScheduleView;
  rows: readonly ScheduleSessionListRow[];
  sortOrder: SessionSortOrder;
  onSortOrderChange: (order: SessionSortOrder) => void;
};

function listRowsForSelectedDay(
  rows: readonly AdminScheduleSession[],
  view: ScheduleView,
  selectedStripDay: string | null,
): AdminScheduleSession[] {
  if (view !== "list" || selectedStripDay === null) {
    return [...rows];
  }
  return rows.filter(
    (row) => scheduleSessionLocalIsoDay(row.startsAt) === selectedStripDay,
  );
}

function useCoachScheduleViewChrome() {
  const [selectedStripDay, setSelectedStripDay] = useState<string | null>(() =>
    scheduleTodayIsoDate(),
  );
  const [visibleYearMonth, setVisibleYearMonth] = useState(() =>
    yearMonthFromIsoDay(scheduleTodayIsoDate()),
  );
  const handleShiftVisibleMonth = useCallback((deltaMonths: number) => {
    setVisibleYearMonth((current) => addCalendarMonths(current, deltaMonths));
  }, []);

  return { selectedStripDay, setSelectedStripDay, visibleYearMonth, handleShiftVisibleMonth };
}

function CoachSessionRosterSheet({
  locale,
  row,
  onClose,
}: {
  locale: string;
  row: AdminScheduleSession | null;
  onClose: () => void;
}) {
  if (row === null) {
    return null;
  }
  return (
    <AdminSessionRegistrationsModal
      isOpen
      sessionId={row.id}
      sessionTitle={row.title}
      startsAt={row.startsAt}
      locale={locale}
      booked={row._count.bookings}
      capacity={row.capacity}
      canAdd={false}
      onClose={onClose}
    />
  );
}

export function CoachScheduleViews({
  locale,
  view,
  rows,
  sortOrder,
  onSortOrderChange,
}: CoachScheduleViewsProps) {
  const chrome = useCoachScheduleViewChrome();
  const [rosterRow, setRosterRow] = useState<AdminScheduleSession | null>(null);
  const adminRows = useMemo(
    () => rows.map(mapListRowToAdminScheduleSession),
    [rows],
  );
  const displayRows = useMemo(
    () => listRowsForSelectedDay(adminRows, view, chrome.selectedStripDay),
    [adminRows, chrome.selectedStripDay, view],
  );

  return (
    <ScheduleViews
      locale={locale}
      view={view}
      rows={displayRows}
      dateStripRows={adminRows}
      dateStripTotalCount={adminRows.length}
      selectedStripDay={chrome.selectedStripDay}
      onSelectStripDay={(day) => chrome.setSelectedStripDay(day)}
      onSelectAllStripDays={() => chrome.setSelectedStripDay(null)}
      visibleYearMonth={chrome.visibleYearMonth}
      onShiftVisibleMonth={chrome.handleShiftVisibleMonth}
      sortOrder={sortOrder}
      onDateTimeSort={() => onSortOrderChange(toggleSessionDateSortOrder(sortOrder))}
      busyId={null}
      onDetails={setRosterRow}
      canAddVisitor={false}
      showCoach={false}
    />
    <CoachSessionRosterSheet
      locale={locale}
      row={rosterRow}
      onClose={() => setRosterRow(null)}
    />
  );
}
