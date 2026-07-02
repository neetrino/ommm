"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AdminBookingDetailsSheet } from "@/components/admin/admin-booking-details-sheet";
import { AdminBookingsConfirmDialog } from "@/components/admin/admin-bookings-confirm-dialog";
import { AdminBookingsListView } from "@/components/admin/admin-bookings-list-view";
import { AdminBookingsMetric } from "@/components/admin/admin-bookings-metric";
import { AdminBookingsMoveDialog } from "@/components/admin/admin-bookings-move-dialog";
import { useAdminBookingsRowActions } from "@/components/admin/admin-bookings-row-actions";
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
  parseAdminBookingPaymentFilter,
  parseBookingRowKey,
  type AdminBookingDetailPayload,
  type AdminBookingRow,
} from "@/components/admin/admin-bookings-query";
import type { AdminBookingsManagementProps } from "@/components/admin/admin-bookings-management.types";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { resolveBookingsView } from "@/components/admin/admin-bookings-view";
import { AdminBookingsViewSwitcher } from "@/components/admin/admin-bookings-view-switcher";
import { useUrlViewState } from "@/hooks/use-url-view-state";
import { LIST_BOARD_VIEW_QUERY_KEY } from "@/lib/list-board-view";
import { ScheduleWeekColumnsView } from "@/components/shared/schedule/schedule-week-columns-view";
import { apiFetch } from "@/lib/api";
import { mapAdminBookingSessionToWeekRow } from "@/lib/map-admin-booking-session-to-week-row";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { PendingBookingConfirm } from "@/components/admin/admin-bookings-management.types";

export type { AdminBookingsManagementProps } from "@/components/admin/admin-bookings-management.types";

export function AdminBookingsManagement({
  locale,
  initial,
  initialFilters,
  variant = "full",
  staffBanner,
}: AdminBookingsManagementProps) {
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
  const [fetchedRow, setFetchedRow] = useState<AdminBookingRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingBookingConfirm | null>(null);

  if (urlBookingKey !== prevUrlBookingKey) {
    setPrevUrlBookingKey(urlBookingKey);
    setSelectedRowKey(urlBookingKey);
  }

  if (selectedRowKey === null && fetchedRow !== null) {
    setFetchedRow(null);
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
    (row: AdminBookingRow) => {
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
    (row: AdminBookingRow) => {
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
      return undefined;
    }

    const combined = [...payload.rows, ...calendarRows];
    if (combined.some((row) => bookingRowKey(row) === selectedRowKey)) {
      return undefined;
    }

    const parsed = parseBookingRowKey(selectedRowKey);
    if (parsed === null || parsed.recordType !== "BOOKING") {
      return undefined;
    }

    let cancelled = false;
    void apiFetch(`/bookings/admin/${parsed.id}`)
      .then((detail) => {
        if (cancelled) {
          return;
        }
        setFetchedRow(mapAdminBookingDetailToRow(detail as AdminBookingDetailPayload));
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

  const { runRowAction, rowActionHandlers, closeBookingConfirm, confirmBookingAction } =
    useAdminBookingsRowActions({
      busyId,
      setBusyId,
      setStatusMessage,
      setPayload,
      router,
      selectedRowKey,
      closeBookingDetails,
      openBookingDetails,
      openMoveModal,
      pendingConfirm,
      setPendingConfirm,
      t,
    });

  const bookingFilterFields = useMemo(
    () =>
      buildAdminBookingsFilterFields({
        classTypes: payload.filterOptions.classTypes,
        coaches: payload.filterOptions.coaches,
        statusLabels: {
          BOOKED: t("statusBooked"),
          COMPLETED: t("statusCompleted"),
          CANCELLED: t("statusCancelled"),
          WAITLISTED: t("statusWaitlisted"),
        },
        paymentLabels: {
          PAID: t("paymentPaid"),
          CASH: t("paymentCash"),
          UNPAID: t("paymentUnpaid"),
          CANCELLED: t("paymentCancelled"),
        },
        labels: {
          dateFrom: t("filterDateFrom"),
          dateTo: t("filterDateTo"),
          classAll: t("filterClassAll"),
          coachAll: t("filterCoachAll"),
          statusAll: t("filterStatusAll"),
          payment: t("filterPayment"),
          paymentAll: t("filterPaymentAll"),
        },
      }),
    [payload.filterOptions.classTypes, payload.filterOptions.coaches, t],
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
    if (key === "paymentStatus") {
      updateFilter("paymentStatus", parseAdminBookingPaymentFilter(value));
      return;
    }
    if (
      key === "from" ||
      key === "to" ||
      key === "classTypeId" ||
      key === "coachId" ||
      key === "status"
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
    <AdminBookingsListView
      locale={locale}
      listRows={payload.rows}
      busyId={busyId}
      pagination={payload.pagination}
      listPage={listPage}
      loading={loading}
      showPagination={isStaff || view === "list"}
      colUserPhone={t("colUserPhone")}
      colCoach={t("colCoach")}
      colClassType={t("colClassType")}
      colDateTime={t("colDateTime")}
      colStatus={t("colStatus")}
      colActions={t("colActions")}
      onOpenDetails={openBookingDetails}
      onOpenUser={setActiveUserId}
      onPageChange={setListPage}
      rowActionHandlers={rowActionHandlers}
    />
  );

  const detailActionRow = drawerRow ? (selectedRow ?? drawerRow) : null;
  const detailHandlers = detailActionRow ? rowActionHandlers(detailActionRow) : null;
  const summary = payload.summary;

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
          <AdminBookingsMetric title={t("summaryTotal")} value={summary.total} />
          <AdminBookingsMetric title={t("summaryBooked")} value={summary.booked} />
          <AdminBookingsMetric title={t("summaryWaitlisted")} value={summary.waitlisted} />
          <AdminBookingsMetric title={t("summaryToday")} value={summary.today} />
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
              <AdminBookingsMetric title={t("summaryTotal")} value={summary.total} />
              <AdminBookingsMetric title={t("summaryBooked")} value={summary.booked} />
              <AdminBookingsMetric title={t("summaryWaitlisted")} value={summary.waitlisted} />
              <AdminBookingsMetric title={t("summaryToday")} value={summary.today} />
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
      {drawerRow && detailHandlers ? (
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
          onMove={detailHandlers.onMove}
          onChangeStatus={detailHandlers.onChangeStatus}
          onDelete={detailHandlers.onDelete}
        />
      ) : null}
      {showMoveModal && selectedRow ? (
        <AdminBookingsMoveDialog
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
      <AdminBookingsConfirmDialog
        pendingConfirm={pendingConfirm}
        busyId={busyId}
        onConfirm={() => {
          void confirmBookingAction();
        }}
        onCancel={closeBookingConfirm}
        t={t}
      />
    </div>
  );
}
