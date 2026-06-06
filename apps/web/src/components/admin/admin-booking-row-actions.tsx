"use client";

import { useTranslations } from "next-intl";
import {
  ADMIN_ACTION_ICON_CLASS,
  CancelGlyph,
  CheckCircleGlyph,
} from "@/components/ui/admin-action-glyphs";
import { OmmButton } from "@/components/ui/omm-button";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";

/** White pill with sand border + shadow — readable on white list cards. */
const BOOKING_CONFIRM_BUTTON_CLASS =
  "gap-1.5 border-sand-500/45 bg-white text-sage-900 shadow-[0_6px_18px_-12px_rgba(45,40,35,0.3)] hover:border-sand-500/60 hover:bg-white hover:text-sage-900 hover:shadow-[0_10px_22px_-14px_rgba(45,40,35,0.36)]";

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
  const showListPrimaryActions = variant === "list" && (canMarkAttended || canCancel);
  const showSheetSecondary = variant === "sheet" && isBooking;

  if (!showListPrimaryActions && !showSheetSecondary) {
    return null;
  }

  return (
    <div
      className={
        variant === "sheet"
          ? "flex w-full flex-wrap items-center justify-end gap-2"
          : "flex items-center justify-end gap-2"
      }
    >
      {showListPrimaryActions ? (
        <div className="flex items-center gap-2" role="group" aria-label={t("colActions")}>
          {canMarkAttended ? (
            <OmmButton
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              aria-label={t("actionMarkAttended")}
              title={t("actionMarkAttended")}
              className={BOOKING_CONFIRM_BUTTON_CLASS}
              onClick={onMarkAttended}
            >
              <CheckCircleGlyph className="h-3.5 w-3.5 shrink-0" />
              {t("actionConfirm")}
            </OmmButton>
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
      ) : null}

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
