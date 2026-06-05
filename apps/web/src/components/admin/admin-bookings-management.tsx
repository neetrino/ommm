"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AdminBookingCompactRow } from "@/components/admin/admin-booking-compact-row";
import { AdminBookingDetailsSheet } from "@/components/admin/admin-booking-details-sheet";
import {
  adminBookingsFilterValuesFromState,
  buildAdminBookingsFilterFields,
} from "@/components/admin/admin-bookings-filter-fields";
import { AdminIntegratedSearchFilters } from "@/components/admin/admin-integrated-search-filters";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import {
  ADMIN_BOOKINGS_LIST_ACTIONS_HEADER_CELL,
  ADMIN_BOOKINGS_LIST_HEADER_CLASS,
  ADMIN_BOOKINGS_LIST_TABLE_CLASS,
} from "@/components/admin/admin-bookings-list-layout";
import {
  type BookingsView,
} from "@/components/admin/admin-bookings-view-icons";
import { AdminBookingsViewSwitcher } from "@/components/admin/admin-bookings-view-switcher";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { OmmFilterDropdown } from "@/components/ui/omm-select-dropdown";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateForUi, formatDateTimeForUi } from "@/lib/date-display";
import { useCloseOnEscape } from "@/hooks/use-close-on-escape";

const DRAWER_CLOSE_BUTTON_CLASSES =
  "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-sage-500 transition-[background-color,color,transform] hover:bg-sand-50 hover:text-sage-900 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/40 focus-visible:ring-offset-2";

type AdminBookingSessionSlot = {
  id: string;
  title: string;
  status: "DRAFT" | "ACTIVE" | "FULL" | "CANCELLED";
  startsAt: string;
  endsAt: string;
  capacity: number;
  bookedCount: number;
  spotsLeft: number;
  level: string | null;
  classFormat: string | null;
  classType: { id: string; name: string };
  coach: { id: string; name: string | null };
};

type BookingRow = {
  id: string;
  recordType: "BOOKING" | "WAITLIST";
  status: "BOOKED" | "COMPLETED" | "CANCELLED" | "MISSED" | "WAITLISTED";
  attendanceStatus: "ATTENDED" | "NOT_ATTENDED" | "NO_SHOW" | "LATE_CANCEL" | null;
  paymentStatus: "PAID" | "CASH" | "UNPAID" | "REFUNDED";
  channel: "WEBSITE" | "APP";
  registerDate: string;
  user: { id: string; name: string | null; email: string; phone: string | null };
  session: {
    id: string;
    startsAt: string;
    endsAt: string;
    classType: { id: string; name: string };
    coach: { id: string; name: string | null };
  };
  package: {
    planName: string;
    sessionsRemaining: number | null;
    sessionsPerMonth: number | null;
    isUnlimited: boolean;
  } | null;
  latestNote: { id: string; body: string; authorName: string | null; createdAt: string } | null;
};

type Props = {
  locale: string;
  initial: {
    rows: BookingRow[];
    summary: {
      total: number;
      booked: number;
      completed: number;
      cancelled: number;
      waitlisted: number;
      today: number;
    };
    filterOptions: {
      classTypes: Array<{ id: string; name: string }>;
      coaches: Array<{ id: string; name: string }>;
    };
    sessionSlots: AdminBookingSessionSlot[];
  };
};

const VIEW_KEY = "admin.bookings.view";

function bookingRowKey(row: Pick<BookingRow, "id" | "recordType">): string {
  return `${row.recordType}-${row.id}`;
}

type BookingConfirmKind = "cancel" | "delete";

type PendingBookingConfirm = {
  kind: BookingConfirmKind;
  row: BookingRow;
};

export function AdminBookingsManagement({ locale, initial }: Props) {
  const t = useTranslations("adminPages.bookings");
  const tSearchTools = useTranslations("adminPages.searchTools");
  const router = useRouter();
  const [rows, setRows] = useState<BookingRow[]>(initial.rows);
  const sessionSlots = initial.sessionSlots;
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [view, setView] = useState<BookingsView>("list");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [classTypeId, setClassTypeId] = useState("");
  const [coachId, setCoachId] = useState("");
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState("");
  const [selectedDay, setSelectedDay] = useState(() => new Date().toISOString().slice(0, 10));
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const [moveBooking, setMoveBooking] = useState<BookingRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingBookingConfirm | null>(null);

  const selectedRow = useMemo(() => {
    if (selectedRowKey === null) {
      return null;
    }
    return rows.find((row) => bookingRowKey(row) === selectedRowKey) ?? null;
  }, [rows, selectedRowKey]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VIEW_KEY);
      if (
        saved === "monthly" ||
        saved === "weekly" ||
        saved === "daily"
      ) {
        startTransition(() => {
          setView(saved);
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setViewAndPersist = useCallback((nextView: BookingsView) => {
    setView(nextView);
    try {
      window.localStorage.setItem(VIEW_KEY, nextView);
    } catch {
      /* ignore */
    }
  }, []);

  const uniqueClients = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of rows) {
      map.set(row.user.id, row.user.name ?? row.user.email);
    }
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [rows]);

  const filteredSessions = useMemo(() => {
    return sessionSlots.filter((session) => {
      if (from) {
        if (new Date(session.startsAt) < new Date(`${from}T00:00:00`)) {
          return false;
        }
      }
      if (to) {
        if (new Date(session.startsAt) > new Date(`${to}T23:59:59`)) {
          return false;
        }
      }
      if (classTypeId && session.classType.id !== classTypeId) {
        return false;
      }
      if (coachId && session.coach.id !== coachId) {
        return false;
      }
      return true;
    });
  }, [sessionSlots, from, to, classTypeId, coachId]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (q.length > 0) {
        const hay = `${row.user.name ?? ""} ${row.user.email} ${row.user.phone ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (from) {
        if (new Date(row.session.startsAt) < new Date(`${from}T00:00:00`)) return false;
      }
      if (to) {
        if (new Date(row.session.startsAt) > new Date(`${to}T23:59:59`)) return false;
      }
      if (classTypeId && row.session.classType.id !== classTypeId) return false;
      if (coachId && row.session.coach.id !== coachId) return false;
      if (clientId && row.user.id !== clientId) return false;
      if (status && row.status !== status) return false;
      return true;
    });
  }, [rows, search, from, to, classTypeId, coachId, clientId, status]);

  const summary = useMemo(() => {
    return {
      total: filteredRows.length,
      booked: filteredRows.filter((row) => row.status === "BOOKED").length,
      completed: filteredRows.filter((row) => row.status === "COMPLETED").length,
      cancelled: filteredRows.filter((row) => row.status === "CANCELLED").length,
      waitlisted: filteredRows.filter((row) => row.status === "WAITLISTED").length,
      today: filteredRows.filter((row) => formatDateForUi(row.session.startsAt) === formatDateForUi(new Date())).length,
    };
  }, [filteredRows]);

  async function runRowAction(id: string, action: () => Promise<void>, ok: string) {
    setBusyId(id);
    setStatusMessage(null);
    try {
      await action();
      setStatusMessage(ok);
      router.refresh();
    } catch (error) {
      setStatusMessage(error instanceof ApiError ? error.message : t("actionFailed"));
    } finally {
      setBusyId(null);
    }
  }

  function openBookingConfirm(kind: BookingConfirmKind, row: BookingRow): void {
    if (busyId !== null) {
      return;
    }
    setPendingConfirm({ kind, row });
  }

  function closeBookingConfirm(): void {
    if (pendingConfirm !== null && busyId === pendingConfirm.row.id) {
      return;
    }
    setPendingConfirm(null);
  }

  async function confirmBookingAction(): Promise<void> {
    if (pendingConfirm === null) {
      return;
    }

    const { kind, row } = pendingConfirm;

    if (kind === "cancel") {
      await runRowAction(row.id, async () => {
        await apiFetch(`/bookings/admin/${row.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "CANCELLED" }),
        });
        setRows((prev) =>
          prev.map((item) =>
            item.id === row.id ? { ...item, status: "CANCELLED" } : item,
          ),
        );
      }, t("successCancelled"));
    } else {
      await runRowAction(row.id, async () => {
        await apiFetch(`/bookings/admin/${row.id}/permanent`, { method: "DELETE" });
        setRows((prev) => prev.filter((item) => item.id !== row.id));
        if (selectedRowKey === bookingRowKey(row)) {
          setSelectedRowKey(null);
        }
      }, t("successDeleted"));
    }

    setPendingConfirm(null);
  }

  function rowActionHandlers(row: BookingRow) {
    return {
      onMarkAttended: () => {
        void runRowAction(row.id, async () => {
          await apiFetch(`/bookings/admin/${row.id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: "COMPLETED" }),
          });
        }, t("successMarkedAttended"));
      },
      onCancel: () => openBookingConfirm("cancel", row),
      onMove: () => setMoveBooking(row),
      onChangeStatus: (nextStatus: BookingRow["status"]) => {
        if (nextStatus === row.status) {
          return;
        }
        if (nextStatus === "CANCELLED") {
          openBookingConfirm("cancel", row);
          return;
        }
        void runRowAction(row.id, async () => {
          await apiFetch(`/bookings/admin/${row.id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: nextStatus }),
          });
          setRows((prev) =>
            prev.map((item) =>
              item.id === row.id ? { ...item, status: nextStatus } : item,
            ),
          );
        }, t("successEdited"));
      },
      onDelete: () => openBookingConfirm("delete", row),
    };
  }

  function resetFilters() {
    setSearch("");
    setFrom("");
    setTo("");
    setClassTypeId("");
    setCoachId("");
    setClientId("");
    setStatus("");
  }

  const bookingFilterFields = useMemo(
    () =>
      buildAdminBookingsFilterFields({
        classTypes: initial.filterOptions.classTypes,
        coaches: initial.filterOptions.coaches,
        clients: uniqueClients,
        statusLabels: {
          BOOKED: t("statusBooked"),
          COMPLETED: t("statusCompleted"),
          CANCELLED: t("statusCancelled"),
          WAITLISTED: t("statusWaitlisted"),
        },
        labels: {
          dateFrom: t("filterDateFrom"),
          dateTo: t("filterDateTo"),
          classAll: t("filterClassAll"),
          coachAll: t("filterCoachAll"),
          clientAll: t("filterClientAll"),
          statusAll: t("filterStatusAll"),
        },
      }),
    [initial.filterOptions.classTypes, initial.filterOptions.coaches, t, uniqueClients],
  );

  const integratedFilterValues = useMemo(
    () =>
      adminBookingsFilterValuesFromState({
        from,
        to,
        classTypeId,
        coachId,
        clientId,
        status,
      }),
    [from, to, classTypeId, coachId, clientId, status],
  );

  function handleIntegratedFilterChange(key: string, value: string) {
    switch (key) {
      case "from":
        setFrom(value);
        break;
      case "to":
        setTo(value);
        break;
      case "classTypeId":
        setClassTypeId(value);
        break;
      case "coachId":
        setCoachId(value);
        break;
      case "clientId":
        setClientId(value);
        break;
      case "status":
        setStatus(value);
        break;
      default:
        break;
    }
  }

  const dayRows = filteredRows
    .filter((row) => sessionDayKey(row.session.startsAt) === selectedDay)
    .sort((a, b) => a.session.startsAt.localeCompare(b.session.startsAt));
  const daySessions = filteredSessions
    .filter((session) => sessionDayKey(session.startsAt) === selectedDay)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const bookedSessionIdsForDay = new Set(dayRows.map((row) => row.session.id));
  const openDaySessions = daySessions.filter((session) => !bookedSessionIdsForDay.has(session.id));

  return (
    <div className="space-y-4">
      <AdminPageHero
        title={t("title")}
        search={
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <AdminIntegratedSearchFilters
              className="min-w-0 flex-1"
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder={t("filterSearch")}
              fields={bookingFilterFields}
              filterValues={integratedFilterValues}
              onFilterChange={handleIntegratedFilterChange}
              onClearAll={resetFilters}
              applyLabel={tSearchTools("applyFilters")}
              resetLabel={t("resetFilters")}
              clearAriaLabel={tSearchTools("clearSearchAndFilters")}
              filterPanelAriaLabel={tSearchTools("filterPanelAria")}
            />
            <AdminBookingsViewSwitcher value={view} onChange={setViewAndPersist} />
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title={t("summaryTotal")} value={summary.total} />
        <Metric title={t("summaryBooked")} value={summary.booked} />
        <Metric title={t("summaryWaitlisted")} value={summary.waitlisted} />
        <Metric title={t("summaryToday")} value={summary.today} />
      </div>

      {statusMessage ? <div className="rounded-xl border border-sand-500/30 bg-white/70 p-3 text-sm text-sage-900">{statusMessage}</div> : null}

      {view === "daily" && openDaySessions.length > 0 ? (
        <div className="space-y-2 rounded-2xl border border-white/60 bg-white/70 p-3">
          <p className="text-sm font-medium text-sage-900">{formatDateForUi(selectedDay)}</p>
          <div className="grid gap-2 md:grid-cols-2">
            {openDaySessions.map((session) => (
              <SessionSlotCard key={session.id} session={session} locale={locale} />
            ))}
          </div>
        </div>
      ) : null}

      {(view === "list" || view === "daily") && (
        <div className={ADMIN_BOOKINGS_LIST_TABLE_CLASS}>
          <div className={ADMIN_BOOKINGS_LIST_HEADER_CLASS}>
            <span>{t("colUserPhone")}</span>
            <span>{t("colClassType")}</span>
            <span>{t("colPaymentStatus")}</span>
            <span>{t("colAttendanceStatus")}</span>
            <span>{t("colChannel")}</span>
            <span>{t("colStatus")}</span>
            <span aria-hidden="true" />
            <span className={ADMIN_BOOKINGS_LIST_ACTIONS_HEADER_CELL}>{t("colActions")}</span>
          </div>
          {(view === "daily" ? dayRows : filteredRows).map((row) => {
            const handlers = rowActionHandlers(row);
            return (
              <AdminBookingCompactRow
                key={bookingRowKey(row)}
                locale={locale}
                row={row}
                busy={busyId === row.id}
                onOpenDetails={() => setSelectedRowKey(bookingRowKey(row))}
                onOpenUser={setActiveUserId}
                {...handlers}
              />
            );
          })}
        </div>
      )}

      {view === "monthly" ? (
        <MonthlyPanel
          rows={filteredRows}
          sessions={filteredSessions}
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
          locale={locale}
          title={t("viewMonthly")}
        />
      ) : null}
      {view === "weekly" ? (
        <WeeklyPanel
          rows={filteredRows}
          sessions={filteredSessions}
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
          locale={locale}
          title={t("viewWeekly")}
        />
      ) : null}

      {activeUserId ? <UserDrawer userId={activeUserId} onClose={() => setActiveUserId(null)} /> : null}
      {selectedRow ? (
        <AdminBookingDetailsSheet
          row={selectedRow}
          locale={locale}
          isOpen
          busy={busyId === selectedRow.id}
          onClose={() => setSelectedRowKey(null)}
          onOpenUser={setActiveUserId}
          onNoteAdded={() => {
            setStatusMessage(t("successNote"));
            router.refresh();
          }}
          {...rowActionHandlers(selectedRow)}
        />
      ) : null}
      {moveBooking ? <MoveBookingDialog booking={moveBooking} onClose={() => setMoveBooking(null)} onSubmit={(targetSessionId) => { void runRowAction(moveBooking.id, async () => { await apiFetch(`/bookings/admin/${moveBooking.id}/move`, { method: "PATCH", body: JSON.stringify({ targetSessionId }) }); }, t("successMoved")); setMoveBooking(null); }} /> : null}
      <OmmConfirmDialog
        isOpen={pendingConfirm !== null}
        title={
          pendingConfirm?.kind === "delete"
            ? t("confirmDeleteTitle")
            : t("confirmCancelTitle")
        }
        description={
          pendingConfirm?.kind === "delete"
            ? t("confirmDelete")
            : t("confirmCancel")
        }
        confirmLabel={
          pendingConfirm?.kind === "delete"
            ? t("confirmDialogDelete")
            : t("confirmDialogCancel")
        }
        cancelLabel={t("confirmDialogNo")}
        backdropAriaLabel={t("confirmDialogBackdrop")}
        tone="danger"
        confirmClassName="ommm-btn-lifecycle-action--danger"
        pending={pendingConfirm !== null && busyId === pendingConfirm.row.id}
        onConfirm={() => {
          void confirmBookingAction();
        }}
        onCancel={closeBookingConfirm}
      />
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3"><p className="text-xs uppercase tracking-wide text-sage-500">{title}</p><p className="mt-1 text-2xl font-semibold text-sage-900">{value}</p></div>;
}

function sessionDayKey(startsAt: string): string {
  return startsAt.slice(0, 10);
}

function CalendarGrid({
  rows,
  sessions,
  selectedDay,
  onSelect,
  title,
}: {
  rows: BookingRow[];
  sessions: readonly AdminBookingSessionSlot[];
  selectedDay: string;
  onSelect: (value: string) => void;
  title: string;
}) {
  const days = useMemo(() => {
    const map = new Map<string, { bookings: number; sessions: number }>();
    for (const session of sessions) {
      const day = sessionDayKey(session.startsAt);
      const current = map.get(day) ?? { bookings: 0, sessions: 0 };
      current.sessions += 1;
      map.set(day, current);
    }
    for (const row of rows) {
      const day = sessionDayKey(row.session.startsAt);
      const current = map.get(day) ?? { bookings: 0, sessions: 0 };
      current.bookings += 1;
      map.set(day, current);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [rows, sessions]);

  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
      <p className="text-sm font-medium text-sage-900">{title}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {days.map(([day, counts]) => (
          <button
            key={day}
            className={`rounded-xl border px-3 py-2 text-left ${day === selectedDay ? "border-indigo-300 bg-indigo-50" : "border-white/70 bg-white/80"}`}
            onClick={() => onSelect(day)}
          >
            <p className="text-sm text-sage-900">{formatDateForUi(day)}</p>
            <p className="text-xs text-sage-600">
              {counts.sessions} · {counts.bookings}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function SessionSlotCard({
  session,
  locale,
}: {
  session: AdminBookingSessionSlot;
  locale: string;
}) {
  return (
    <div className="rounded-xl border border-mint-200/80 bg-mint-50/60 px-3 py-2 text-sm">
      <div className="font-medium text-sage-900">{session.title}</div>
      <div className="text-xs text-sage-600">
        {formatDateTimeForUi(session.startsAt, locale)} · {session.classType.name} ·{" "}
        {session.coach.name ?? "—"} · {session.spotsLeft}/{session.capacity}
      </div>
    </div>
  );
}

function MonthlyPanel({
  rows,
  sessions,
  selectedDay,
  onSelect,
  locale,
  title,
}: {
  rows: BookingRow[];
  sessions: readonly AdminBookingSessionSlot[];
  selectedDay: string;
  onSelect: (value: string) => void;
  locale: string;
  title: string;
}) {
  const dayRows = rows
    .filter((row) => sessionDayKey(row.session.startsAt) === selectedDay)
    .sort((a, b) => a.session.startsAt.localeCompare(b.session.startsAt));
  const daySessions = sessions
    .filter((session) => sessionDayKey(session.startsAt) === selectedDay)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const bookedSessionIds = new Set(dayRows.map((row) => row.session.id));
  const openSessions = daySessions.filter((session) => !bookedSessionIds.has(session.id));

  return (
    <div className="space-y-3">
      <CalendarGrid
        rows={rows}
        sessions={sessions}
        selectedDay={selectedDay}
        onSelect={onSelect}
        title={title}
      />
      <div className="rounded-2xl border border-white/60 bg-white/70 p-3">
        <p className="text-sm font-medium text-sage-900">{formatDateForUi(selectedDay)}</p>
        <div className="mt-2 space-y-2">
          {dayRows.length === 0 && openSessions.length === 0 ? (
            <p className="text-sm text-sage-500">—</p>
          ) : (
            <>
              {openSessions.map((session) => (
                <SessionSlotCard key={session.id} session={session} locale={locale} />
              ))}
              {dayRows.map((row) => (
                <div
                  key={`${row.recordType}-${row.id}`}
                  className="rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-sm"
                >
                  <div className="font-medium text-sage-900">{row.user.name ?? row.user.email}</div>
                  <div className="text-xs text-sage-600">
                    {formatDateTimeForUi(row.session.startsAt, locale)} · {row.session.classType.name}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function WeeklyPanel({
  rows,
  sessions,
  selectedDay,
  onSelect,
  locale,
  title,
}: {
  rows: BookingRow[];
  sessions: readonly AdminBookingSessionSlot[];
  selectedDay: string;
  onSelect: (value: string) => void;
  locale: string;
  title: string;
}) {
  const selected = new Date(`${selectedDay}T00:00:00`);
  const mondayOffset = (selected.getDay() + 6) % 7;
  const monday = new Date(selected);
  monday.setDate(selected.getDate() - mondayOffset);
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    const iso = day.toISOString().slice(0, 10);
    const dayRows = rows
      .filter((row) => sessionDayKey(row.session.startsAt) === iso)
      .sort((a, b) => a.session.startsAt.localeCompare(b.session.startsAt));
    const daySessions = sessions
      .filter((session) => sessionDayKey(session.startsAt) === iso)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    return { iso, rows: dayRows, sessions: daySessions };
  });

  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
      <p className="text-sm font-medium text-sage-900">{title}</p>
      <div className="mt-3 grid gap-2 lg:grid-cols-7">
        {days.map((day) => (
          <button
            key={day.iso}
            className={`rounded-xl border px-2 py-2 text-left align-top ${day.iso === selectedDay ? "border-indigo-300 bg-indigo-50" : "border-white/70 bg-white/80"}`}
            onClick={() => onSelect(day.iso)}
          >
            <p className="text-xs font-medium text-sage-700">{formatDateForUi(day.iso)}</p>
            <div className="mt-1 space-y-1">
              {day.sessions.slice(0, 4).map((session) => (
                <div
                  key={session.id}
                  className="rounded-md border border-mint-200/70 bg-mint-50/70 px-2 py-1 text-[11px] text-sage-700"
                >
                  {formatDateTimeForUi(session.startsAt, locale).split(" ")[1]} · {session.title}
                </div>
              ))}
              {day.rows.slice(0, 6).map((row) => (
                <div
                  key={`${row.recordType}-${row.id}`}
                  className="rounded-md bg-white/70 px-2 py-1 text-[11px] text-sage-700"
                >
                  {formatDateTimeForUi(row.session.startsAt, locale).split(" ")[1]} ·{" "}
                  {row.user.name ?? row.user.email}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function UserDrawer({ userId, onClose }: { userId: string; onClose: () => void }) {
  const t = useTranslations("adminPages.bookings");
  useCloseOnEscape(true, onClose);
  const [data, setData] = useState<null | {
    name: string | null;
    email: string;
    phone: string | null;
    bookings?: Array<{ id: string; status: string; session: { startsAt: string; classType: { name: string } } }>;
  }>(null);
  useEffect(() => {
    void apiFetch(`/clients/${userId}`)
      .then((payload) =>
        setData(
          payload as {
            name: string | null;
            email: string;
            phone: string | null;
            bookings?: Array<{
              id: string;
              status: string;
              session: { startsAt: string; classType: { name: string } };
            }>;
          },
        ),
      )
      .catch(() => setData(null));
  }, [userId]);
  return (
    <div className="ommm-drawer-overlay z-40">
      <button className="ommm-modal-backdrop" onClick={onClose} aria-label={t("close")} />
      <aside className="relative z-10 h-full w-full max-w-md overflow-auto bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">{t("userDetailsTitle")}</h3>
          <button type="button" className={DRAWER_CLOSE_BUTTON_CLASSES} onClick={onClose}>x</button>
        </div>
        {data === null ? (
          <p className="text-sm text-sage-500">{t("emptyUserData")}</p>
        ) : (
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-sage-900">{data.name ?? data.email}</p>
              <p className="text-sage-600">{data.phone ?? "—"}</p>
              <p className="text-sage-600">{data.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-sage-500">{t("bookingHistory")}</p>
              <div className="mt-1 space-y-1">
                {(data.bookings ?? []).slice(0, 8).map((booking) => (
                  <p key={booking.id} className="rounded-md bg-white/80 px-2 py-1 text-xs">
                    {formatDateTimeForUi(booking.session.startsAt)} · {booking.session.classType.name} · {booking.status}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
function MoveBookingDialog({ booking, onClose, onSubmit }: { booking: BookingRow; onClose: () => void; onSubmit: (targetSessionId: string) => void }) {
  const t = useTranslations("adminPages.bookings");
  useCloseOnEscape(true, onClose);
  const [targetSessionId, setTargetSessionId] = useState("");
  const [options, setOptions] = useState<Array<{ id: string; startsAt: string; classType: { name: string }; coach: { user: { name: string | null } } }>>([]);
  useEffect(() => {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 30);
    const q = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}&typeId=${encodeURIComponent(booking.session.classType.id)}`;
    void apiFetch(`/classes/admin/sessions?${q}`)
      .then((payload) =>
        setOptions(
          (
            payload as Array<{
              id: string;
              startsAt: string;
              status: AdminBookingSessionSlot["status"];
              classType: { name: string };
              coach: { user: { name: string | null } };
            }>
          )
            .filter(
              (row) =>
                row.id !== booking.session.id &&
                row.status !== "CANCELLED" &&
                row.status !== "DRAFT",
            )
            .map((row) => ({
              id: row.id,
              startsAt: row.startsAt,
              classType: row.classType,
              coach: { user: { name: row.coach.user.name } },
            })),
        ),
      )
      .catch(() => setOptions([]));
  }, [booking.session.classType.id, booking.session.id]);
  const slotOptions = options.map((row) => ({
    value: row.id,
    label: `${formatDateTimeForUi(row.startsAt)} · ${row.classType.name} · ${row.coach.user.name ?? "—"}`,
  }));

  return (
    <div className="ommm-modal-overlay z-50 items-center p-4" role="presentation">
      <button type="button" className="ommm-modal-backdrop" onClick={onClose} aria-label={t("close")} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/60 bg-white p-4">
        <h3 className="text-base font-semibold text-sage-900">{t("actionMove")}</h3>
        <p className="mt-1 text-sm text-sage-600">
          {booking.user.name ?? booking.user.email} · {booking.session.classType.name}
        </p>
        <div className="mt-3">
          <OmmFilterDropdown
            allValue=""
            value={targetSessionId}
            ariaLabel={t("selectClassSlot")}
            allLabel={t("selectClassSlot")}
            onChange={setTargetSessionId}
            options={slotOptions}
            disabled={slotOptions.length === 0}
          />
        </div>
        {options.length === 0 ? (
          <p className="mt-2 text-xs text-sage-500">{t("emptyMoveOptions")}</p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <OmmButton size="sm" variant="ghost" onClick={onClose}>
            {t("close")}
          </OmmButton>
          <OmmButton
            size="sm"
            variant="primary"
            disabled={targetSessionId === ""}
            onClick={() => onSubmit(targetSessionId)}
          >
            {t("actionMove")}
          </OmmButton>
        </div>
      </div>
    </div>
  );
}
