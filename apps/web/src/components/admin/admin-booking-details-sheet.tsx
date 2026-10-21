"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminBookingRowActions } from "@/components/admin/admin-booking-row-actions";
import { AdminBookingStatusPicker } from "@/components/admin/admin-booking-status-picker";
import { normalizeBookingStatusBadgePaymentMethod } from "@/components/admin/admin-booking-list-badges";
import { AdminBookingDetailsBody } from "@/components/admin/admin-booking-details-body";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS,
  ADMIN_BOOKINGS_DETAILS_SHEET_PANEL_CLASS,
  ADMIN_DETAILS_SHEET_FOOTER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_LEDE_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { useAdminAnimatedSheetClose } from "@/components/admin/use-admin-animated-sheet-close";
import { apiFetch } from "@/lib/api";

type ListRow = {
  id: string;
  recordType: "BOOKING" | "WAITLIST";
  status: "BOOKED" | "COMPLETED" | "CANCELLED" | "MISSED" | "WAITLISTED";
  attendanceStatus: "ATTENDED" | "NOT_ATTENDED" | "NO_SHOW" | "LATE_CANCEL" | null;
  paymentStatus: "PAID" | "CASH" | "UNPAID" | "CANCELLED";
  bookingPaymentMethod: string | null;
  channel: "WEBSITE" | "APP";
  registerDate: string;
  user: { id: string; name: string | null; email: string; phone: string | null };
  session: {
    id: string;
    startsAt: string;
    endsAt: string;
    classType: { id: string; name: string };
    coach: { id: string; name: string | null };
  };
  package: {
    planName: string;
    sessionsRemaining: number | null;
    sessionsPerMonth: number | null;
    isUnlimited: boolean;
  } | null;
  latestNote: { id: string; body: string; authorName: string | null; createdAt: string } | null;
  guestName?: string | null;
};

type BookingDetails = {
  status: string;
  bookingPaymentMethod?: string | null;
  createdAt: string;
  user: { name: string | null; email: string; phone: string | null };
  session: {
    startsAt: string;
    endsAt: string;
    classType: { name: string };
    coach: { user: { name: string | null } };
  };
};

export type AdminBookingDetailsSheetProps = {
  row: ListRow | null;
  locale: string;
  busy: boolean;
  onClose: () => void;
  onMove: () => void;
  onChangeStatus: (status: ListRow["status"]) => void;
  onDelete?: () => void;
};

export function AdminBookingDetailsSheet({
  row,
  locale,
  busy,
  onClose,
  onMove,
  onChangeStatus,
  onDelete,
}: AdminBookingDetailsSheetProps) {
  const t = useTranslations("adminPages.bookings");
  const titleId = useId();
  const { isOpen: sheetOpen, requestClose, onAfterClose } = useAdminAnimatedSheetClose(onClose);
  const fetchKey =
    sheetOpen && row !== null && row.recordType === "BOOKING" ? row.id : null;
  const [result, setResult] = useState<{
    key: string;
    details: BookingDetails | null;
  } | null>(null);
  const loading = fetchKey !== null && (result === null || result.key !== fetchKey);
  const details =
    fetchKey !== null && result?.key === fetchKey ? result.details : null;

  useEffect(() => {
    if (fetchKey === null) {
      return undefined;
    }

    let cancelled = false;
    void apiFetch(`/bookings/admin/${fetchKey}`)
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setResult({
          key: fetchKey,
          details: payload as BookingDetails,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setResult({
            key: fetchKey,
            details: null,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  if (row === null) {
    return null;
  }

  const bookingPaymentMethod = normalizeBookingStatusBadgePaymentMethod(
    details?.bookingPaymentMethod ?? row.bookingPaymentMethod,
  );

  return (
    <AdminSheetPortal presentation="drawer"
      isOpen={sheetOpen}
      onClose={requestClose}
      onAfterClose={onAfterClose}
      backdropAriaLabel={t("bookingDetailsCloseBackdrop")}
      ariaLabelledBy={titleId}
      drawerOverlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      drawerPanelClassName={ADMIN_BOOKINGS_DETAILS_SHEET_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
              {row.session.classType.name}
            </h2>
            <p className={ADMIN_DETAILS_SHEET_LEDE_CLASS}>{t("bookingDetailsLead")}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <button
              type="button"
              className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
              aria-label={t("bookingDetailsClose")}
              onClick={onClose}
            >
              <CloseGlyph />
            </button>
            <AdminBookingStatusPicker
              recordType={row.recordType}
              status={row.status}
              bookingPaymentMethod={bookingPaymentMethod}
              busy={busy}
              onChangeStatus={onChangeStatus}
            />
          </div>
        </div>
      </header>

      <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
        {loading ? (
          <p className="text-sm text-sage-500">{t("bookingDetailsLoading")}</p>
        ) : (
          <AdminBookingDetailsBody
            locale={locale}
            view={{
              clientName: row.user.name ?? row.user.email,
              email: row.user.email,
              phone: row.user.phone,
              coachName: details?.session.coach.user.name ?? row.session.coach.name ?? "—",
              startsAt: row.session.startsAt,
              endsAt: row.session.endsAt,
              bookedAt: details?.createdAt ?? row.registerDate,
              guestName: row.guestName ?? null,
              packagePlan: row.package,
            }}
          />
        )}
      </div>

      {row.recordType === "BOOKING" ? (
        <footer className={ADMIN_DETAILS_SHEET_FOOTER_CLASS}>
          <AdminBookingRowActions
            variant="sheet"
            recordType={row.recordType}
            status={row.status}
            busy={busy}
            onMove={onMove}
            onDelete={onDelete}
          />
        </footer>
      ) : null}
    </AdminSheetPortal>
  );
}

function CloseGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
