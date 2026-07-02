"use client";

import { useCallback } from "react";
import type { useTranslations } from "next-intl";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ApiError, apiFetch } from "@/lib/api";
import {
  bookingRowKey,
  type AdminBookingRow,
  type AdminBookingsManagementPayload,
} from "@/components/admin/admin-bookings-query";
import type {
  BookingConfirmKind,
  PendingBookingConfirm,
} from "@/components/admin/admin-bookings-management.types";

export type AdminBookingsRowActionHandlers = {
  onEdit: () => void;
  onMarkAttended: () => void;
  onCancel: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
  onMove: () => void;
  onChangeStatus: (nextStatus: AdminBookingRow["status"]) => void;
  onDelete: () => void;
};

type UseAdminBookingsRowActionsParams = {
  busyId: string | null;
  setBusyId: (id: string | null) => void;
  setStatusMessage: (message: string | null) => void;
  setPayload: React.Dispatch<React.SetStateAction<AdminBookingsManagementPayload>>;
  router: AppRouterInstance;
  selectedRowKey: string | null;
  closeBookingDetails: () => void;
  openBookingDetails: (row: AdminBookingRow) => void;
  openMoveModal: (row: AdminBookingRow) => void;
  pendingConfirm: PendingBookingConfirm | null;
  setPendingConfirm: (value: PendingBookingConfirm | null) => void;
  t: ReturnType<typeof useTranslations<"adminPages.bookings">>;
};

export function useAdminBookingsRowActions({
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
}: UseAdminBookingsRowActionsParams) {
  const runRowAction = useCallback(
    async (id: string, action: () => Promise<void>, ok: string) => {
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
    },
    [router, setBusyId, setStatusMessage, t],
  );

  const openBookingConfirm = useCallback(
    (kind: BookingConfirmKind, row: AdminBookingRow): void => {
      if (busyId !== null) {
        return;
      }
      setPendingConfirm({ kind, row });
    },
    [busyId, setPendingConfirm],
  );

  const closeBookingConfirm = useCallback((): void => {
    if (pendingConfirm !== null && busyId === pendingConfirm.row.id) {
      return;
    }
    setPendingConfirm(null);
  }, [busyId, pendingConfirm, setPendingConfirm]);

  const confirmBookingAction = useCallback(async (): Promise<void> => {
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
    } else if (kind === "activate") {
      await runRowAction(row.id, async () => {
        await apiFetch(`/bookings/admin/${row.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "BOOKED" }),
        });
        setPayload((prev) => ({
          ...prev,
          rows: prev.rows.map((item) =>
            item.id === row.id ? { ...item, status: "BOOKED" } : item,
          ),
        }));
      }, t("successActivated"));
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
  }, [
    closeBookingDetails,
    pendingConfirm,
    runRowAction,
    selectedRowKey,
    setPayload,
    setPendingConfirm,
    t,
  ]);

  const rowActionHandlers = useCallback(
    (row: AdminBookingRow): AdminBookingsRowActionHandlers => ({
      onEdit: () => openBookingDetails(row),
      onMarkAttended: () => openBookingConfirm("attended", row),
      onCancel: () => openBookingConfirm("cancel", row),
      onDeactivate: () => openBookingConfirm("cancel", row),
      onActivate: () => openBookingConfirm("activate", row),
      onMove: () => openMoveModal(row),
      onChangeStatus: (nextStatus: AdminBookingRow["status"]) => {
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
    }),
    [
      openBookingConfirm,
      openBookingDetails,
      openMoveModal,
      runRowAction,
      setPayload,
      t,
    ],
  );

  return {
    runRowAction,
    rowActionHandlers,
    closeBookingConfirm,
    confirmBookingAction,
  };
}
