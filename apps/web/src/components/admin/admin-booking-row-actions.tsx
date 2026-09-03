"use client";

import { useTranslations } from "next-intl";
import {
  ArrowRightGlyph,
  CheckCircleGlyph,
  PencilGlyph,
  ToggleOffGlyph,
} from "@/components/ui/admin-action-glyphs";
import { OmmButton } from "@/components/ui/omm-button";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";

type BookingRecordType = "BOOKING" | "WAITLIST";
type BookingStatus = "BOOKED" | "COMPLETED" | "CANCELLED" | "MISSED" | "WAITLISTED";

const BOOKING_ACTION_BUTTON_CLASS = "h-8 w-8";
const BOOKING_ACTION_ICON_CLASS = "h-4 w-4 shrink-0";

export type AdminBookingRowActionsProps = {
  variant?: "list" | "sheet";
  recordType: BookingRecordType;
  status: BookingStatus;
  busy: boolean;
  onEdit?: () => void;
  onMove?: () => void;
  onDeactivate?: () => void;
  onActivate?: () => void;
  onDelete?: () => void;
};

export function AdminBookingRowActions({
  variant = "list",
  recordType,
  status,
  busy,
  onEdit,
  onMove,
  onDeactivate,
  onActivate,
  onDelete,
}: AdminBookingRowActionsProps) {
  const t = useTranslations("adminPages.bookings");
  const isBooking = recordType === "BOOKING";
  const isInactive = status === "CANCELLED";
  const canDeactivate =
    isBooking &&
    (status === "BOOKED" || status === "COMPLETED" || status === "MISSED") &&
    onDeactivate !== undefined;
  const canActivate = isBooking && isInactive && onActivate !== undefined;
  const canMove = isBooking && onMove !== undefined;
  const showListActions = variant === "list" && onEdit !== undefined;
  const showSheetSecondary = variant === "sheet" && isBooking;

  if (!showListActions && !showSheetSecondary) {
    return null;
  }

  if (showListActions) {
    return (
      <div
        className="flex items-center justify-end gap-1"
        role="group"
        aria-label={t("colActions")}
      >
        <AdminRowIconButton
          ariaLabel={t("actionEditBooking")}
          title={t("actionEditBooking")}
          variant="subtle"
          className={BOOKING_ACTION_BUTTON_CLASS}
          disabled={busy}
          onClick={(event) => {
            event.stopPropagation();
            onEdit?.();
          }}
        >
          <PencilGlyph className={BOOKING_ACTION_ICON_CLASS} />
        </AdminRowIconButton>
        {canMove ? (
          <AdminRowIconButton
            ariaLabel={t("actionMoveBooking")}
            title={t("actionMoveBooking")}
            className={BOOKING_ACTION_BUTTON_CLASS}
            disabled={busy}
            onClick={(event) => {
              event.stopPropagation();
              onMove?.();
            }}
          >
            <ArrowRightGlyph className={BOOKING_ACTION_ICON_CLASS} />
          </AdminRowIconButton>
        ) : null}
        {canDeactivate ? (
          <AdminRowIconButton
            ariaLabel={t("actionDeactivateBooking")}
            title={t("actionDeactivateBooking")}
            variant="danger"
            className={BOOKING_ACTION_BUTTON_CLASS}
            disabled={busy}
            onClick={(event) => {
              event.stopPropagation();
              onDeactivate?.();
            }}
          >
            <ToggleOffGlyph className={BOOKING_ACTION_ICON_CLASS} />
          </AdminRowIconButton>
        ) : null}
        {canActivate ? (
          <AdminRowIconButton
            ariaLabel={t("actionActivateBooking")}
            title={t("actionActivateBooking")}
            className={BOOKING_ACTION_BUTTON_CLASS}
            disabled={busy}
            onClick={(event) => {
              event.stopPropagation();
              onActivate?.();
            }}
          >
            <CheckCircleGlyph className={BOOKING_ACTION_ICON_CLASS} />
          </AdminRowIconButton>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-wrap items-center justify-end gap-2">
      <OmmButton size="sm" variant="ghost" disabled={busy} onClick={onMove}>
        {t("actionMove")}
      </OmmButton>
      {onDelete ? (
        <OmmButton size="sm" variant="danger" disabled={busy} onClick={onDelete}>
          {t("actionDelete")}
        </OmmButton>
      ) : null}
    </div>
  );
}
