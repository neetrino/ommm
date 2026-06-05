"use client";

import { useTranslations } from "next-intl";
import {
  ADMIN_ACTION_ICON_CLASS,
  CancelGlyph,
  CheckCircleGlyph,
} from "@/components/ui/admin-action-glyphs";
import { OmmButton } from "@/components/ui/omm-button";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";

type BookingRecordType = "BOOKING" | "WAITLIST";
type BookingStatus = "BOOKED" | "COMPLETED" | "CANCELLED" | "MISSED" | "WAITLISTED";

export type AdminBookingRowActionsProps = {
  variant?: "list" | "sheet";
  recordType: BookingRecordType;
  status: BookingStatus;
  busy: boolean;
  onMarkAttended: () => void;
  onCancel: () => void;
  onMove?: () => void;
  onDelete?: () => void;
};

export function AdminBookingRowActions({
  variant = "list",
  recordType,
  status,
  busy,
  onMarkAttended,
  onCancel,
  onMove,
  onDelete,
}: AdminBookingRowActionsProps) {
  const t = useTranslations("adminPages.bookings");
  const isBooking = recordType === "BOOKING";
  const canMarkAttended = isBooking && status === "BOOKED";
  const canCancel = isBooking && status === "BOOKED";
  const hasPrimaryActions = canMarkAttended || canCancel;
  const showSheetSecondary = variant === "sheet" && isBooking;

  if (!hasPrimaryActions && !showSheetSecondary) {
    return null;
  }

  return (
    <div
      className={
        variant === "sheet"
          ? "flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          : "flex items-center justify-end gap-1"
      }
    >
      {hasPrimaryActions ? (
        <div className="flex items-center gap-1" role="group" aria-label={t("colActions")}>
          {canMarkAttended ? (
            <AdminRowIconButton
              ariaLabel={t("actionMarkAttended")}
              title={t("actionMarkAttended")}
              onClick={onMarkAttended}
              disabled={busy}
            >
              <CheckCircleGlyph className={ADMIN_ACTION_ICON_CLASS} />
            </AdminRowIconButton>
          ) : null}
          {canCancel ? (
            <AdminRowIconButton
              ariaLabel={t("actionCancel")}
              title={t("actionCancel")}
              variant="danger"
              onClick={onCancel}
              disabled={busy}
            >
              <CancelGlyph className={ADMIN_ACTION_ICON_CLASS} />
            </AdminRowIconButton>
          ) : null}
        </div>
      ) : (
        <span aria-hidden="true" />
      )}

      {showSheetSecondary ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <OmmButton size="sm" variant="ghost" disabled={busy} onClick={onMove}>
            {t("actionMove")}
          </OmmButton>
          <OmmButton size="sm" variant="danger" disabled={busy} onClick={onDelete}>
            {t("actionDelete")}
          </OmmButton>
        </div>
      ) : null}
    </div>
  );
}
