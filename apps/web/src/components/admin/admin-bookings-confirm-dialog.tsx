"use client";

import type { useTranslations } from "next-intl";
import type { PendingBookingConfirm } from "@/components/admin/admin-bookings-management.types";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";

type AdminBookingsConfirmDialogProps = {
  pendingConfirm: PendingBookingConfirm | null;
  busyId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  t: ReturnType<typeof useTranslations<"adminPages.bookings">>;
};

export function AdminBookingsConfirmDialog({
  pendingConfirm,
  busyId,
  onConfirm,
  onCancel,
  t,
}: AdminBookingsConfirmDialogProps) {
  return (
    <OmmConfirmDialog
      isOpen={pendingConfirm !== null}
      title={
        pendingConfirm?.kind === "delete"
          ? t("confirmDeleteTitle")
          : pendingConfirm?.kind === "attended"
            ? t("confirmAttendedTitle")
            : pendingConfirm?.kind === "activate"
              ? t("confirmActivateTitle")
              : t("confirmCancelTitle")
      }
      description={
        pendingConfirm?.kind === "delete"
          ? t("confirmDelete")
          : pendingConfirm?.kind === "attended"
            ? t("confirmAttended")
            : pendingConfirm?.kind === "activate"
              ? t("confirmActivate")
              : t("confirmCancel")
      }
      confirmLabel={
        pendingConfirm?.kind === "delete"
          ? t("confirmDialogDelete")
          : pendingConfirm?.kind === "attended"
            ? t("confirmDialogYes")
            : pendingConfirm?.kind === "activate"
              ? t("confirmDialogYes")
              : t("confirmDialogCancel")
      }
      cancelLabel={t("confirmDialogNo")}
      backdropAriaLabel={t("confirmDialogBackdrop")}
      tone={
        pendingConfirm?.kind === "attended" || pendingConfirm?.kind === "activate"
          ? "success"
          : "danger"
      }
      confirmClassName={
        pendingConfirm?.kind === "attended" || pendingConfirm?.kind === "activate"
          ? "ommm-btn-lifecycle-action--success"
          : "ommm-btn-lifecycle-action--danger"
      }
      pending={pendingConfirm !== null && busyId === pendingConfirm.row.id}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
