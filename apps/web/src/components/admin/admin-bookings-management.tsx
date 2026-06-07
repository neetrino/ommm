"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AdminBookingCompactRow } from "@/components/admin/admin-booking-compact-row";
import { AdminBookingDetailsSheet } from "@/components/admin/admin-booking-details-sheet";
import { AdminUserDetailsDrawer } from "@/components/admin/admin-user-details-drawer";
import {
  adminBookingsFilterValuesFromState,
  buildAdminBookingsFilterFields,
} from "@/components/admin/admin-bookings-filter-fields";
import { useAdminBookingsListData } from "@/components/admin/admin-bookings-list-data";
import {
  ADMIN_BOOKINGS_ACTION_QUERY_KEY,
  ADMIN_BOOKINGS_BOOKING_ID_QUERY_KEY,
  ADMIN_BOOKINGS_MOVE_ACTION,
  bookingRowKey,
  buildLoadingBookingRow,
  mapAdminBookingDetailToRow,
  parseBookingRowKey,
  type AdminBookingDetailPayload,
  type AdminBookingRow,
  type AdminBookingSessionSlot,
  type AdminBookingsFilterState,
  type AdminBookingsManagementPayload,
} from "@/components/admin/admin-bookings-query";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import {
  ADMIN_BOOKINGS_LIST_ACTIONS_HEADER_CELL,
  ADMIN_BOOKINGS_LIST_EMPHASIZED_HEADER,
  ADMIN_BOOKINGS_LIST_HEADER_CLASS,
  ADMIN_BOOKINGS_LIST_TABLE_CLASS,
} from "@/components/admin/admin-bookings-list-layout";
import {
  type BookingsView,
  resolveBookingsView,
} from "@/components/admin/admin-bookings-view";
import { AdminBookingsViewSwitcher } from "@/components/admin/admin-bookings-view-switcher";
import { useUrlViewState } from "@/hooks/use-url-view-state";
import { LIST_BOARD_VIEW_QUERY_KEY } from "@/lib/list-board-view";
import { ScheduleWeekColumnsView } from "@/components/shared/schedule/schedule-week-columns-view";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { OmmFilterDropdown } from "@/components/ui/omm-select-dropdown";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateTimeForUi } from "@/lib/date-display";
import { mapAdminBookingSessionToWeekRow } from "@/lib/map-admin-booking-session-to-week-row";
import { usePathname, useRouter } from "@/i18n/navigation";

type BookingRow = AdminBookingRow;

type Props = {
  locale: string;
  initial: AdminBookingsManagementPayload;
  initialFilters: AdminBookingsFilterState;
  /** Staff surfaces (manager): list-only canon rows, no calendar hero/metrics. */
  variant?: "full" | "staff";
  staffBanner?: string;
};

type BookingConfirmKind = "cancel" | "delete" | "attended";

type PendingBookingConfirm = {
  kind: BookingConfirmKind;
  row: BookingRow;
};

export function AdminBookingsManagement({
  locale,
  initial,
  initialFilters,
  variant = "full",
  staffBanner,
}: Props) {
  const isStaff = variant === "staff";
  const t = useTranslations("adminPages.bookings");
  const tSchedule = useTranslations("adminPages.schedule");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlBookingKey = searchParams.get(ADMIN_BOOKINGS_BOOKING_ID_QUERY_KEY);
  const urlAction = searchParams.get(ADMIN_BOOKINGS_ACTION_QUERY_KEY);
  const [view, setViewAndPersist] = useUrlViewState(LIST_BOARD_VIEW_QUERY_KEY, (value) =>
    resolveBookingsView(value ?? undefined),
  );
  const {
    payload,
    calendarRows,
    calendarSessions,
    filters,
    listPage,
    loading,
    setListPage,
    updateFilter,
    resetFilters,
    setPayload,
  } = useAdminBookingsListData({
    initial,
    initialFilters,
    view: isStaff ? "list" : view,
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(urlBookingKey);
  const [prevUrlBookingKey, setPrevUrlBookingKey] = useState(urlBookingKey);
  const [fetchedRow, setFetchedRow] = useState<BookingRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingBookingConfirm | null>(null);

  if (urlBookingKey !== prevUrlBookingKey) {
    setPrevUrlBookingKey(urlBookingKey);
    setSelectedRowKey(urlBookingKey);
  }

  const replaceSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutator(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const pushSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutator(params);
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const openBookingDetails = useCallback(
    (row: BookingRow) => {
      const key = bookingRowKey(row);
      setSelectedRowKey(key);
      pushSearchParams((params) => {
        params.set(ADMIN_BOOKINGS_BOOKING_ID_QUERY_KEY, key);
      });
    },
    [pushSearchParams],
  );

  const closeBookingDetails = useCallback(() => {
    setSelectedRowKey(null);
    setFetchedRow(null);
    replaceSearchParams((params) => {
      params.delete(ADMIN_BOOKINGS_BOOKING_ID_QUERY_KEY);
      params.delete(ADMIN_BOOKINGS_ACTION_QUERY_KEY);
    });
  }, [replaceSearchParams]);

  const openMoveModal = useCallback(
    (row: BookingRow) => {
      const key = bookingRowKey(row);
      setSelectedRowKey(key);
      pushSearchParams((params) => {
        params.set(ADMIN_BOOKINGS_BOOKING_ID_QUERY_KEY, key);
        params.set(ADMIN_BOOKINGS_ACTION_QUERY_KEY, ADMIN_BOOKINGS_MOVE_ACTION);
      });
    },
    [pushSearchParams],
  );

  const closeMoveModal = useCallback(() => {
    replaceSearchParams((params) => {
      params.delete(ADMIN_BOOKINGS_ACTION_QUERY_KEY);
    });
  }, [replaceSearchParams]);

  const selectedRow = useMemo(() => {
    if (selectedRowKey === null) {
      return null;
    }
    const combined = [...payload.rows, ...calendarRows];
    const found = combined.find((row) => bookingRowKey(row) === selectedRowKey);
    if (found !== undefined) {
      return found;
    }
    if (fetchedRow !== null && bookingRowKey(fetchedRow) === selectedRowKey) {
      return fetchedRow;
    }
    return null;
  }, [calendarRows, fetchedRow, payload.rows, selectedRowKey]);

  const showMoveModal =
    urlAction === ADMIN_BOOKINGS_MOVE_ACTION &&
    selectedRow !== null &&
    selectedRow.recordType === "BOOKING";

  const drawerRow = useMemo(() => {
    if (selectedRow !== null) {
      return selectedRow;
    }
    if (selectedRowKey === null) {
      return null;
    }
    return buildLoadingBookingRow(selectedRowKey);
  }, [selectedRow, selectedRowKey]);

  useEffect(() => {
    if (selectedRowKey === null) {
      setFetchedRow(null);
      return undefined;
    }

    const combined = [...payload.rows, ...calendarRows];
    if (combined.some((row) => bookingRowKey(row) === selectedRowKey)) {
      setFetchedRow(null);
      return undefined;
    }

    const parsed = parseBookingRowKey(selectedRowKey);
    if (parsed === null || parsed.recordType !== "BOOKING") {
      return undefined;
    }

    let cancelled = false;
    void apiFetch(`/bookings/admin/${parsed.id}`)
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setFetchedRow(mapAdminBookingDetailToRow(payload as AdminBookingDetailPayload));
      })
      .catch(() => {
        if (!cancelled) {
          setFetchedRow(null);
          replaceSearchParams((params) => {
            params.delete(ADMIN_BOOKINGS_BOOKING_ID_QUERY_KEY);
            params.delete(ADMIN_BOOKINGS_ACTION_QUERY_KEY);
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [calendarRows, payload.rows, replaceSearchParams, selectedRowKey]);

  useEffect(() => {
    if (
      urlAction === ADMIN_BOOKINGS_MOVE_ACTION &&
      selectedRow !== null &&
      selectedRow.recordType !== "BOOKING"
    ) {
      replaceSearchParams((params) => {
        params.delete(ADMIN_BOOKINGS_ACTION_QUERY_KEY);
      });
    }
  }, [replaceSearchParams, selectedRow, urlAction]);

  const uniqueClients = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of [...payload.rows, ...calendarRows]) {
      map.set(row.user.id, row.user.name ?? row.user.email);
    }
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [calendarRows, payload.rows]);

  const filteredSessions = useMemo(() => {
    return calendarSessions.filter((session) => {
      if (filters.from) {
        if (new Date(session.startsAt) < new Date(`${filters.from}T00:00:00`)) {
          return false;
        }
      }
      if (filters.to) {
        if (new Date(session.startsAt) > new Date(`${filters.to}T23:59:59`)) {
          return false;
        }
      }
      if (filters.classTypeId && session.classType.id !== filters.classTypeId) {
        return false;
      }
      if (filters.coachId && session.coach.id !== filters.coachId) {
        return false;
      }
      return true;
    });
  }, [calendarSessions, filters.classTypeId, filters.coachId, filters.from, filters.to]);

  const listRows = payload.rows;
  const summary = payload.summary;
  const pagination = payload.pagination;

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

    if (kind === "attended") {
      await runRowAction(row.id, async () => {
        await apiFetch(`/bookings/admin/${row.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "COMPLETED" }),
        });
        setPayload((prev) => ({
          ...prev,
          rows: prev.rows.map((item) =>
            item.id === row.id ? { ...item, status: "COMPLETED" } : item,
          ),
        }));
      }, t("successMarkedAttended"));
    } else if (kind === "cancel") {
      await runRowAction(row.id, async () => {
        await apiFetch(`/bookings/admin/${row.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "CANCELLED" }),
        });
        setPayload((prev) => ({
          ...prev,
          rows: prev.rows.map((item) =>
            item.id === row.id ? { ...item, status: "CANCELLED" } : item,
          ),
        }));
      }, t("successCancelled"));
    } else {
      await runRowAction(row.id, async () => {
        await apiFetch(`/bookings/admin/${row.id}/permanent`, { method: "DELETE" });
        setPayload((prev) => ({
          ...prev,
          rows: prev.rows.filter((item) => item.id !== row.id),
        }));
        if (selectedRowKey === bookingRowKey(row)) {
          closeBookingDetails();
        }
      }, t("successDeleted"));
    }

    setPendingConfirm(null);
  }

  function rowActionHandlers(row: BookingRow) {
    return {
      onMarkAttended: () => openBookingConfirm("attended", row),
      onCancel: () => openBookingConfirm("cancel", row),
      onMove: () => openMoveModal(row),
      onChangeStatus: (nextStatus: BookingRow["status"]) => {
        if (nextStatus === row.status) {
          return;
        }
        if (nextStatus === "CANCELLED") {
          openBookingConfirm("cancel", row);
          return;
        }
        if (nextStatus === "COMPLETED") {
          openBookingConfirm("attended", row);
          return;
        }
        void runRowAction(row.id, async () => {
          await apiFetch(`/bookings/admin/${row.id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: nextStatus }),
          });
          setPayload((prev) => ({
            ...prev,
            rows: prev.rows.map((item) =>
              item.id === row.id ? { ...item, status: nextStatus } : item,
            ),
          }));
        }, t("successEdited"));
      },
      onDelete: () => openBookingConfirm("delete", row),
    };
  }

  const tSort = useTranslations("listSort");
  const bookingFilterFields = useMemo(
    () =>
      buildAdminBookingsFilterFields({
        classTypes: payload.filterOptions.classTypes,
        coaches: payload.filterOptions.coaches,
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
          sort: tSort("sort"),
          sortLabels: {
            upcoming: tSort("upcoming"),
            "date-asc": tSort("dateAsc"),
            "date-desc": tSort("dateDesc"),
            newest: tSort("newest"),
            oldest: tSort("oldest"),
          },
        },
      }),
    [payload.filterOptions.classTypes, payload.filterOptions.coaches, t, tSort, uniqueClients],
  );

  const integratedFilterValues = useMemo(
    () => adminBookingsFilterValuesFromState(filters),
    [filters],
  );

  function handleIntegratedFilterChange(key: string, value: string) {
    if (key === "search") {
      updateFilter("search", value);
      return;
    }
    if (
      key === "from" ||
      key === "to" ||
      key === "classTypeId" ||
      key === "coachId" ||
      key === "clientId" ||
      key === "status" ||
      key === "order"
    ) {
      updateFilter(key, value);
    }
  }

  const weekRows = useMemo(
    () => filteredSessions.map(mapAdminBookingSessionToWeekRow),
    [filteredSessions],
  );

  const handleWeekSessionClick = useCallback(
    (sessionId: string) => {
      const booking = calendarRows.find((row) => row.session.id === sessionId);
      if (booking) {
        openBookingDetails(booking);
      }
    },
    [calendarRows, openBookingDetails],
  );

  const bookingsList = (
    <>
      <div className={ADMIN_BOOKINGS_LIST_TABLE_CLASS}>
        <div className={ADMIN_BOOKINGS_LIST_HEADER_CLASS}>
          <span>{t("colUserPhone")}</span>
          <span className={ADMIN_BOOKINGS_LIST_EMPHASIZED_HEADER}>{t("colClassType")}</span>
          <span className={ADMIN_BOOKINGS_LIST_EMPHASIZED_HEADER}>{t("colDateTime")}</span>
          <span className={ADMIN_BOOKINGS_LIST_EMPHASIZED_HEADER}>{t("colPaymentStatus")}</span>
          <span className={ADMIN_BOOKINGS_LIST_EMPHASIZED_HEADER}>{t("colAttendanceStatus")}</span>
          <span aria-hidden="true" />
          <span className={`${ADMIN_BOOKINGS_LIST_EMPHASIZED_HEADER} justify-self-end text-right`}>
            {t("colStatus")}
          </span>
          <span className={ADMIN_BOOKINGS_LIST_ACTIONS_HEADER_CELL}>{t("colActions")}</span>
        </div>
        {listRows.map((row) => {
          const handlers = rowActionHandlers(row);
          return (
            <AdminBookingCompactRow
              key={bookingRowKey(row)}
              locale={locale}
              row={row}
              busy={busyId === row.id}
              onOpenDetails={() => openBookingDetails(row)}
              onOpenUser={setActiveUserId}
              {...handlers}
            />
          );
        })}
      </div>
      {(isStaff || view === "list") && pagination ? (
        <OmmListPagination
          total={pagination.total}
          page={listPage.page}
          pageSize={listPage.pageSize}
          offset={pagination.offset}
          onPageChange={(page) => setListPage(page)}
          onPageSizeChange={(pageSize) => setListPage(1, pageSize)}
          disabled={loading}
        />
      ) : null}
    </>
  );

  return (
    <div className="space-y-4">
      {!isStaff ? (
        <AdminPageHero
          title={t("title")}
          search={
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <ListPageSearchFilters
                search={filters.search}
                onSearchChange={(value) => updateFilter("search", value)}
                searchPlaceholder={t("filterSearch")}
                fields={bookingFilterFields}
                filterValues={integratedFilterValues}
                onFilterChange={handleIntegratedFilterChange}
                onClearAll={resetFilters}
                resetLabel={t("resetFilters")}
              />
              <AdminBookingsViewSwitcher value={view} onChange={setViewAndPersist} />
            </div>
          }
        />
      ) : null}

      {!isStaff ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric title={t("summaryTotal")} value={summary.total} />
          <Metric title={t("summaryBooked")} value={summary.booked} />
          <Metric title={t("summaryWaitlisted")} value={summary.waitlisted} />
          <Metric title={t("summaryToday")} value={summary.today} />
        </div>
      ) : null}

      {isStaff ? (
        <StaffListPageLayout
          title={t("title")}
          banner={staffBanner}
          search={
            <ListPageSearchFilters
              search={filters.search}
              onSearchChange={(value) => updateFilter("search", value)}
              searchPlaceholder={t("filterSearch")}
              fields={bookingFilterFields}
              filterValues={integratedFilterValues}
              onFilterChange={handleIntegratedFilterChange}
              onClearAll={resetFilters}
              resetLabel={t("resetFilters")}
            />
          }
          metrics={
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric title={t("summaryTotal")} value={summary.total} />
              <Metric title={t("summaryBooked")} value={summary.booked} />
              <Metric title={t("summaryWaitlisted")} value={summary.waitlisted} />
              <Metric title={t("summaryToday")} value={summary.today} />
            </div>
          }
          status={
            statusMessage ? (
              <div className="rounded-xl border border-sand-500/30 bg-white/70 p-3 text-sm text-sage-900">
                {statusMessage}
              </div>
            ) : null
          }
        >
          {bookingsList}
        </StaffListPageLayout>
      ) : (
        <>
          {statusMessage ? (
            <div className="rounded-xl border border-sand-500/30 bg-white/70 p-3 text-sm text-sage-900">
              {statusMessage}
            </div>
          ) : null}
          {view === "list" ? bookingsList : null}
          {view === "weekly" ? (
            <ScheduleWeekColumnsView
              locale={locale}
              rows={weekRows}
              showCoach
              cardVariant="staff"
              onSessionClick={(session) => handleWeekSessionClick(session.id)}
              labels={{
                gridAria: tSchedule("weekView.gridAria"),
                todayBadge: tSchedule("weekView.todayBadge"),
                emptyDay: tSchedule("weekView.emptyDay"),
              }}
            />
          ) : null}
        </>
      )}

      {activeUserId ? (
        <AdminUserDetailsDrawer
          locale={locale}
          userId={activeUserId}
          onClose={() => setActiveUserId(null)}
        />
      ) : null}
      {drawerRow ? (
        <AdminBookingDetailsSheet
          row={drawerRow}
          locale={locale}
          isOpen
          busy={busyId === drawerRow.id}
          onClose={closeBookingDetails}
          onOpenUser={setActiveUserId}
          onNoteAdded={() => {
            setStatusMessage(t("successNote"));
            router.refresh();
          }}
          {...rowActionHandlers(selectedRow ?? drawerRow)}
        />
      ) : null}
      {showMoveModal && selectedRow ? (
        <MoveBookingDialog
          isOpen
          booking={selectedRow}
          onClose={closeMoveModal}
          onSubmit={(targetSessionId) => {
            void runRowAction(
              selectedRow.id,
              async () => {
                await apiFetch(`/bookings/admin/${selectedRow.id}/move`, {
                  method: "PATCH",
                  body: JSON.stringify({ targetSessionId }),
                });
              },
              t("successMoved"),
            );
            closeMoveModal();
          }}
        />
      ) : null}
      <OmmConfirmDialog
        isOpen={pendingConfirm !== null}
        title={
          pendingConfirm?.kind === "delete"
            ? t("confirmDeleteTitle")
            : pendingConfirm?.kind === "attended"
              ? t("confirmAttendedTitle")
              : t("confirmCancelTitle")
        }
        description={
          pendingConfirm?.kind === "delete"
            ? t("confirmDelete")
            : pendingConfirm?.kind === "attended"
              ? t("confirmAttended")
              : t("confirmCancel")
        }
        confirmLabel={
          pendingConfirm?.kind === "delete"
            ? t("confirmDialogDelete")
            : pendingConfirm?.kind === "attended"
              ? t("confirmDialogYes")
              : t("confirmDialogCancel")
        }
        cancelLabel={t("confirmDialogNo")}
        backdropAriaLabel={t("confirmDialogBackdrop")}
        tone={pendingConfirm?.kind === "attended" ? "success" : "danger"}
        confirmClassName={
          pendingConfirm?.kind === "attended"
            ? "ommm-btn-lifecycle-action--success"
            : "ommm-btn-lifecycle-action--danger"
        }
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

function MoveBookingDialog({
  isOpen,
  booking,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  booking: BookingRow;
  onClose: () => void;
  onSubmit: (targetSessionId: string) => void;
}) {
  const t = useTranslations("adminPages.bookings");
  const titleId = useId();
  const [targetSessionId, setTargetSessionId] = useState("");
  const [options, setOptions] = useState<
    Array<{
      id: string;
      startsAt: string;
      classType: { name: string };
      coach: { user: { name: string | null } };
    }>
  >([]);
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
    <OmmModalPortal
      isOpen={isOpen}
      onClose={onClose}
      backdropAriaLabel={t("close")}
      ariaLabelledBy={titleId}
      overlayClassName="ommm-modal-overlay z-[110] items-center p-4"
      panelClassName="w-full max-w-lg rounded-2xl border border-white/60 bg-white p-4"
    >
      <h3 id={titleId} className="text-base font-semibold text-sage-900">
        {t("actionMove")}
      </h3>
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
    </OmmModalPortal>
  );
}
