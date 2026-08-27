"use client";

import { AdminBookingCompactRow } from "@/components/admin/admin-booking-compact-row";
import type { AdminBookingsRowActionHandlers } from "@/components/admin/admin-bookings-row-actions";
import {
  ADMIN_BOOKINGS_LIST_EMPHASIZED_HEADER,
  ADMIN_BOOKINGS_LIST_HEADER_CELL,
  ADMIN_BOOKINGS_LIST_HEADER_CLASS,
  ADMIN_BOOKINGS_LIST_TABLE_CLASS,
} from "@/components/admin/admin-bookings-list-layout";
import { bookingRowKey, type AdminBookingRow } from "@/components/admin/admin-bookings-query";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";

type AdminBookingsListViewProps = {
  locale: string;
  listRows: readonly AdminBookingRow[];
  busyId: string | null;
  pagination: { total: number; offset: number } | null | undefined;
  listPage: { page: number; pageSize: number };
  loading: boolean;
  showPagination: boolean;
  colUserPhone: string;
  colCoach: string;
  colClassType: string;
  colDateTime: string;
  colStatus: string;
  colActions: string;
  onOpenDetails: (row: AdminBookingRow) => void;
  onOpenUser: (userId: string) => void;
  onPageChange: (page: number) => void;
  rowActionHandlers: (row: AdminBookingRow) => AdminBookingsRowActionHandlers;
};

export function AdminBookingsListView({
  locale,
  listRows,
  busyId,
  pagination,
  listPage,
  loading,
  showPagination,
  colUserPhone,
  colCoach,
  colClassType,
  colDateTime,
  colStatus,
  colActions,
  onOpenDetails,
  onOpenUser,
  onPageChange,
  rowActionHandlers,
}: AdminBookingsListViewProps) {
  return (
    <>
      <div className={ADMIN_BOOKINGS_LIST_TABLE_CLASS}>
        <div className={ADMIN_BOOKINGS_LIST_HEADER_CLASS}>
          <span className={ADMIN_BOOKINGS_LIST_HEADER_CELL}>{colUserPhone}</span>
          <span className={ADMIN_BOOKINGS_LIST_EMPHASIZED_HEADER}>{colCoach}</span>
          <span className={ADMIN_BOOKINGS_LIST_EMPHASIZED_HEADER}>{colClassType}</span>
          <span className={ADMIN_BOOKINGS_LIST_EMPHASIZED_HEADER}>{colDateTime}</span>
          <span className={ADMIN_BOOKINGS_LIST_EMPHASIZED_HEADER}>{colStatus}</span>
          <span className={ADMIN_BOOKINGS_LIST_EMPHASIZED_HEADER}>{colActions}</span>
        </div>
        {listRows.map((row) => {
          const handlers = rowActionHandlers(row);
          return (
            <AdminBookingCompactRow
              key={bookingRowKey(row)}
              locale={locale}
              row={row}
              busy={busyId === row.id}
              onOpenDetails={() => onOpenDetails(row)}
              onOpenUser={onOpenUser}
              onEdit={handlers.onEdit}
              onMove={handlers.onMove}
              onDeactivate={handlers.onDeactivate}
              onActivate={handlers.onActivate}
              onChangeStatus={handlers.onChangeStatus}
            />
          );
        })}
      </div>
      {showPagination && pagination ? (
        <OmmListPagination
          total={pagination.total}
          page={listPage.page}
          pageSize={listPage.pageSize}
          offset={pagination.offset}
          onPageChange={onPageChange}
          disabled={loading}
        />
      ) : null}
    </>
  );
}
