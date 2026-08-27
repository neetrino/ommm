"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminBookingDetailsSheet } from "@/components/admin/admin-booking-details-sheet";
import { AdminBookingsConfirmDialog } from "@/components/admin/admin-bookings-confirm-dialog";
import { AdminBookingsListView } from "@/components/admin/admin-bookings-list-view";
import { AdminBookingsManagementContent } from "@/components/admin/admin-bookings-management-content";
import { AdminBookingsMoveDialog } from "@/components/admin/admin-bookings-move-dialog";
import { useAdminBookingsRowActions } from "@/components/admin/admin-bookings-row-actions";
import { useAdminBookingsDetailSelection } from "@/components/admin/use-admin-bookings-detail-selection";
import { AdminUserDetailsDrawer } from "@/components/admin/admin-user-details-drawer";
import {
  adminBookingsFilterValuesFromState,
  buildAdminBookingsFilterFields,
  sessionMatchesAdminBookingDateFilter,
} from "@/components/admin/admin-bookings-filter-fields";
import { useAdminBookingsListData } from "@/components/admin/admin-bookings-list-data";
import { parseAdminBookingPaymentFilter } from "@/components/admin/admin-bookings-query";
import type { AdminBookingsManagementProps } from "@/components/admin/admin-bookings-management.types";
import { resolveBookingsView } from "@/components/admin/admin-bookings-view";
import { useUrlViewState } from "@/hooks/use-url-view-state";
import { useIsMarketingPhoneViewport } from "@/hooks/use-is-marketing-phone-viewport";
import { LIST_BOARD_VIEW_QUERY_KEY } from "@/lib/list-board-view";
import { apiFetch } from "@/lib/api";
import { mapAdminBookingSessionToWeekRow } from "@/lib/map-admin-booking-session-to-week-row";
import { useRouter } from "@/i18n/navigation";
import type { PendingBookingConfirm } from "@/components/admin/admin-bookings-management.types";
import {
  adminBookingCapabilities,
  type BookingCapabilities,
} from "@/lib/backoffice-capabilities";

export type { AdminBookingsManagementProps } from "@/components/admin/admin-bookings-management.types";

function resolveBookingCapabilities(
  capabilities: BookingCapabilities | undefined,
): BookingCapabilities {
  return capabilities ?? adminBookingCapabilities();
}

export function AdminBookingsManagement({
  locale,
  initial,
  initialFilters,
  variant = "full",
  staffBanner,
  capabilities,
}: AdminBookingsManagementProps) {
  const caps = resolveBookingCapabilities(capabilities);
  const isStaff = variant === "staff";
  const t = useTranslations("adminPages.bookings");
  const tSchedule = useTranslations("adminPages.schedule");
  const router = useRouter();
  const [view, setViewAndPersist] = useUrlViewState(LIST_BOARD_VIEW_QUERY_KEY, (value) =>
    resolveBookingsView(value ?? undefined),
  );
  const isPhone = useIsMarketingPhoneViewport();
  const effectiveView = isStaff || isPhone ? "list" : view;
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
    view: effectiveView,
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingBookingConfirm | null>(null);

  const {
    selectedRowKey,
    selectedRow,
    drawerRow,
    showMoveModal,
    openBookingDetails,
    closeBookingDetails,
    openMoveModal,
    closeMoveModal,
  } = useAdminBookingsDetailSelection({
    calendarRows,
    listRows: payload.rows,
  });

  const filteredSessions = useMemo(() => {
    return calendarSessions.filter((session) => {
      if (!sessionMatchesAdminBookingDateFilter(session.startsAt, filters.from, filters.to)) {
        return false;
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
      showPagination={isStaff || effectiveView === "list"}
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

  return (
    <div className="space-y-4">
      <AdminBookingsManagementContent
        isStaff={isStaff}
        view={view}
        locale={locale}
        staffBanner={staffBanner}
        statusMessage={statusMessage}
        filters={filters}
        bookingFilterFields={bookingFilterFields}
        integratedFilterValues={integratedFilterValues}
        summary={payload.summary}
        weekRows={weekRows}
        bookingsList={bookingsList}
        t={t}
        tSchedule={tSchedule}
        onFilterSearchChange={(value) => updateFilter("search", value)}
        onFilterChange={handleIntegratedFilterChange}
        onResetFilters={resetFilters}
        onViewChange={setViewAndPersist}
        onWeekSessionClick={handleWeekSessionClick}
      />

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
          onMove={detailHandlers.onMove}
          onChangeStatus={detailHandlers.onChangeStatus}
          onDelete={caps.canDelete ? detailHandlers.onDelete : undefined}
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
