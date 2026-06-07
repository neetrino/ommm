"use client";

import { useTranslations } from "next-intl";
import {
  ADMIN_ACTION_ICON_CLASS,
  ArrowRightGlyph,
  CheckCircleGlyph,
  PencilGlyph,
  ToggleOffGlyph,
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
  const isActive = status === "BOOKED";
  const isInactive = status === "CANCELLED";
  const canDeactivate = isBooking && isActive && onDeactivate !== undefined;
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
          disabled={busy}
          onClick={(event) => {
            event.stopPropagation();
            onEdit?.();
          }}
        >
          <PencilGlyph className={ADMIN_ACTION_ICON_CLASS} />
        </AdminRowIconButton>
        {canMove ? (
          <AdminRowIconButton
            ariaLabel={t("actionMoveBooking")}
            title={t("actionMoveBooking")}
            disabled={busy}
            onClick={(event) => {
              event.stopPropagation();
              onMove?.();
            }}
          >
            <ArrowRightGlyph className={ADMIN_ACTION_ICON_CLASS} />
          </AdminRowIconButton>
        ) : null}
        {canDeactivate ? (
          <AdminRowIconButton
            ariaLabel={t("actionDeactivateBooking")}
            title={t("actionDeactivateBooking")}
            variant="danger"
            disabled={busy}
            onClick={(event) => {
              event.stopPropagation();
              onDeactivate?.();
            }}
          >
            <ToggleOffGlyph className={ADMIN_ACTION_ICON_CLASS} />
          </AdminRowIconButton>
        ) : null}
        {canActivate ? (
          <AdminRowIconButton
            ariaLabel={t("actionActivateBooking")}
            title={t("actionActivateBooking")}
            disabled={busy}
            onClick={(event) => {
              event.stopPropagation();
              onActivate?.();
            }}
          >
            <CheckCircleGlyph className={ADMIN_ACTION_ICON_CLASS} />
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
      <OmmButton size="sm" variant="danger" disabled={busy} onClick={onDelete}>
        {t("actionDelete")}
      </OmmButton>
    </div>
  );
}
