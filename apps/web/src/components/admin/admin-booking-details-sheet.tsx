"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminBookingNotesSection } from "@/components/admin/admin-booking-notes-section";
import { AdminBookingRowActions } from "@/components/admin/admin-booking-row-actions";
import { AdminBookingStatusPicker } from "@/components/admin/admin-booking-status-picker";
import { formatPackagePlanName } from "@/components/admin/admin-packages-display";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { apiFetch } from "@/lib/api";
import { formatDateForUi, formatDateTimeForUi } from "@/lib/date-display";

const BOOKING_DETAILS_SHEET_WIDTH_CLASS =
  "w-full sm:w-1/4 sm:max-w-[25vw] sm:min-w-[18rem]";

const BOOKING_DETAILS_SHEET_HEIGHT_CLASS = "h-[90dvh]";

const BOOKING_DETAILS_SHEET_PANEL_CLASS = [
  "relative z-10 flex flex-col overflow-hidden",
  BOOKING_DETAILS_SHEET_WIDTH_CLASS,
  BOOKING_DETAILS_SHEET_HEIGHT_CLASS,
  "rounded-tl-[28px] border border-white/70 border-b-0 border-r-0",
  "bg-white/95 shadow-[-16px_0_48px_-24px_rgba(45,40,35,0.4)] backdrop-blur-md",
].join(" ");

type ListRow = {
  id: string;
  recordType: "BOOKING" | "WAITLIST";
  status: "BOOKED" | "COMPLETED" | "CANCELLED" | "MISSED" | "WAITLISTED";
  attendanceStatus: "ATTENDED" | "NOT_ATTENDED" | "NO_SHOW" | "LATE_CANCEL" | null;
  paymentStatus: "PAID" | "CASH" | "UNPAID" | "REFUNDED";
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
};

type BookingNote = {
  id: string;
  body: string;
  createdAt: string;
  author: { name: string | null };
};

type BookingDetails = {
  status: string;
  paymentStatus?: string;
  attendanceStatus?: string;
  channel: "WEBSITE" | "APP";
  createdAt: string;
  user: { name: string | null; email: string; phone: string | null };
  session: {
    startsAt: string;
    endsAt: string;
    classType: { name: string };
    coach: { user: { name: string | null } };
  };
  notes?: BookingNote[];
};

export type AdminBookingDetailsSheetProps = {
  row: ListRow | null;
  locale: string;
  isOpen: boolean;
  busy: boolean;
  onClose: () => void;
  onOpenUser: (userId: string) => void;
  onMarkAttended: () => void;
  onCancel: () => void;
  onMove: () => void;
  onChangeStatus: (status: ListRow["status"]) => void;
  onDelete: () => void;
  onNoteAdded?: () => void;
};

function fallbackNotes(row: ListRow): BookingNote[] {
  if (row.latestNote === null) {
    return [];
  }
  return [
    {
      id: row.latestNote.id,
      body: row.latestNote.body,
      createdAt: row.latestNote.createdAt,
      author: { name: row.latestNote.authorName },
    },
  ];
}

export function AdminBookingDetailsSheet({
  row,
  locale,
  isOpen,
  busy,
  onClose,
  onOpenUser,
  onMarkAttended,
  onCancel,
  onMove,
  onChangeStatus,
  onDelete,
  onNoteAdded,
}: AdminBookingDetailsSheetProps) {
  const t = useTranslations("adminPages.bookings");
  const titleId = useId();
  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [notes, setNotes] = useState<BookingNote[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || row === null) {
      setDetails(null);
      setNotes([]);
      return;
    }
    if (row.recordType !== "BOOKING") {
      setDetails(null);
      setNotes([]);
      return;
    }

    setLoading(true);
    void apiFetch(`/bookings/admin/${row.id}`)
      .then((payload) => {
        const nextDetails = payload as BookingDetails;
        setDetails(nextDetails);
        setNotes(nextDetails.notes ?? fallbackNotes(row));
      })
      .catch(() => {
        setDetails(null);
        setNotes(fallbackNotes(row));
      })
      .finally(() => setLoading(false));
  }, [isOpen, row]);

  if (row === null) {
    return null;
  }

  return (
    <OmmDrawerPortal
      isOpen={isOpen}
      onClose={onClose}
      backdropAriaLabel={t("bookingDetailsCloseBackdrop")}
      ariaLabelledBy={titleId}
      overlayClassName="ommm-drawer-overlay z-[105] items-end"
      panelClassName={BOOKING_DETAILS_SHEET_PANEL_CLASS}
    >
      <header className="shrink-0 border-b border-white/60 px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 id={titleId} className="font-serif text-2xl font-normal text-sage-900">
              {row.session.classType.name}
            </h2>
            <p className="text-sm text-sage-600">{t("bookingDetailsLead")}</p>
            <button
              type="button"
              className="truncate text-left text-sm font-medium text-sage-800 underline-offset-2 hover:underline"
              onClick={() => onOpenUser(row.user.id)}
            >
              {row.user.name ?? row.user.email}
            </button>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <button
              type="button"
              className="rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              aria-label={t("bookingDetailsClose")}
              onClick={onClose}
            >
              <CloseGlyph />
            </button>
            <AdminBookingStatusPicker
              recordType={row.recordType}
              status={row.status}
              busy={busy}
              onChangeStatus={onChangeStatus}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        {loading ? (
          <p className="text-sm text-sage-500">{t("bookingDetailsLoading")}</p>
        ) : (
          <>
            <dl className="space-y-3 rounded-2xl border border-white/60 bg-white/50 p-4">
              <DetailRow label={t("bookingDetailsClient")} value={row.user.name ?? row.user.email} />
              <DetailRow label={t("bookingDetailsEmail")} value={row.user.email} />
              <DetailRow label={t("bookingDetailsPhone")} value={row.user.phone ?? "—"} />
              <DetailRow label={t("bookingDetailsClass")} value={row.session.classType.name} />
              <DetailRow
                label={t("bookingDetailsCoach")}
                value={details?.session.coach.user.name ?? row.session.coach.name ?? "—"}
              />
              <DetailRow
                label={t("bookingDetailsSessionTime")}
                value={formatDateTimeForUi(row.session.startsAt, locale)}
              />
              <DetailRow
                label={t("bookingDetailsBookedOn")}
                value={formatDateForUi(details?.createdAt ?? row.registerDate)}
              />
              <DetailRow
                label={t("colPaymentStatus")}
                value={paymentLabel(t, row.paymentStatus)}
              />
              <DetailRow
                label={t("colAttendanceStatus")}
                value={attendanceLabel(t, row.attendanceStatus)}
              />
              <DetailRow
                label={t("colChannel")}
                value={row.channel === "APP" ? t("channelApp") : t("channelWebsite")}
              />
              {row.package !== null ? (
                <DetailRow
                  label={t("packageInfo")}
                  value={formatPackagePlanName(
                    row.package.planName,
                    row.package.sessionsPerMonth,
                  )}
                />
              ) : null}
            </dl>

            {row.recordType === "BOOKING" ? (
              <AdminBookingNotesSection
                bookingId={row.id}
                notes={notes}
                onNotesChange={setNotes}
                onNoteAdded={onNoteAdded}
              />
            ) : null}
          </>
        )}
      </div>

      {row.recordType === "BOOKING" ? (
        <footer className="shrink-0 border-t border-white/60 px-5 py-4 sm:px-6">
          <div className="flex justify-end">
            <AdminBookingRowActions
              recordType={row.recordType}
              status={row.status}
              busy={busy}
              onMarkAttended={onMarkAttended}
              onCancel={onCancel}
              onMove={onMove}
              onDelete={onDelete}
            />
          </div>
        </footer>
      ) : null}
    </OmmDrawerPortal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">{label}</dt>
      <dd className="text-sm font-medium text-sage-800">{value}</dd>
    </div>
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

function paymentLabel(
  t: ReturnType<typeof useTranslations<"adminPages.bookings">>,
  value: ListRow["paymentStatus"],
): string {
  if (value === "PAID") return t("paymentPaid");
  if (value === "CASH") return t("paymentCash");
  if (value === "REFUNDED") return t("paymentRefunded");
  return t("paymentUnpaid");
}

function attendanceLabel(
  t: ReturnType<typeof useTranslations<"adminPages.bookings">>,
  value: ListRow["attendanceStatus"],
): string {
  if (value === "ATTENDED") return t("attendanceAttended");
  if (value === "NO_SHOW") return t("attendanceNoShow");
  if (value === "LATE_CANCEL") return t("attendanceLateCancel");
  return t("attendanceNotAttended");
}
