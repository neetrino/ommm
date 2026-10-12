"use client";

import type { useTranslations } from "next-intl";
import { useTranslations } from "next-intl";
import { resolveSessionCoachName } from "@/components/account/session-coach-line";
import { AdminClientBookingReturnSessionButton } from "@/components/admin/admin-client-booking-return-session-button";
import { BookingBookedByBadge } from "@/components/admin/admin-booking-booked-by-badge";
import {
  bookingHistoryBookedByMark,
  bookingHistoryCancelledByText,
  canCancelHistoryBooking,
} from "@/components/admin/admin-client-bookings-history.helpers";
import type { ClientSheetBookingItem } from "@/components/admin/admin-clients-types";
import { BanGlyph } from "@/components/ui/admin-action-glyphs";
import { GUEST_PASSES_ENABLED } from "@/lib/guest-passes";
import { formatDateForUi, formatDateTimeForUi } from "@/lib/date-display";

const CANCEL_BUTTON_CLASS = [
  "inline-flex shrink-0 items-center gap-1.5 rounded-full",
  "border border-rose-200/80 bg-rose-50/80 px-2.5 py-1",
  "text-xs font-medium text-rose-700",
  "transition hover:bg-rose-100/90",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");
const CANCEL_ICON_CLASS = "h-3.5 w-3.5 shrink-0";

type ClientsTranslator = ReturnType<typeof useTranslations<"adminPages.clients">>;
type RolesTranslator = ReturnType<typeof useTranslations<"dashboard.shell.roles">>;

type AdminClientBookingHistoryRowProps = {
  booking: ClientSheetBookingItem;
  locale: string;
  allowCancel: boolean;
  busy: boolean;
  onCancel: (booking: ClientSheetBookingItem) => void;
  onReturnSuccess: () => void;
  onReturnError: (message: string) => void;
};

type HistoryRowCopy = {
  coachLabel: string;
  guestName: string | null;
  meta: string;
  signedUp: string;
  extra: string | null;
  cancelledByLabel: string | null;
  bookedBy: { kind: "client" | "staff"; label: string } | null;
  showCancel: boolean;
  showReturn: boolean;
};

function historyRowCopy(params: {
  booking: ClientSheetBookingItem;
  locale: string;
  allowCancel: boolean;
  t: ClientsTranslator;
  tRoles: RolesTranslator;
}): HistoryRowCopy {
  const { booking, locale, allowCancel, t, tRoles } = params;
  const coachName = resolveSessionCoachName(booking.session.coach);
  const roleLabel = (role: Parameters<RolesTranslator>[0]) => tRoles(role);
  const status = booking.cancelledAt != null ? "CANCELLED" : booking.status;
  const metaParts = [formatDateTimeForUi(booking.session.startsAt, locale), status];
  const level = booking.session.level?.trim();
  if (level) {
    metaParts.push(level);
  }
  return {
    coachLabel: coachName
      ? t("drawer.withCoach", { name: coachName })
      : t("drawer.coachUnknown"),
    guestName: GUEST_PASSES_ENABLED ? (booking.guestName ?? null) : null,
    meta: metaParts.join(" · "),
    signedUp: `${t("drawer.signedUp")} ${formatDateTimeForUi(booking.createdAt, locale)}`,
    extra: booking.cancelledAt
      ? `${t("drawer.cancelled")} ${formatDateForUi(booking.cancelledAt)}`
      : booking.attendedAt
        ? `${t("drawer.attended")} ${formatDateForUi(booking.attendedAt)}`
        : null,
    cancelledByLabel: bookingHistoryCancelledByText(booking.cancelledAt, booking.cancelledBy, {
      client: t("drawer.cancelledByClient"),
      staff: (input) => t("drawer.cancelledByStaff", input),
      roleLabel,
    }),
    bookedBy: bookingHistoryBookedByMark(booking.createdBy, {
      client: t("drawer.bookedByClient"),
      staff: (input) => t("drawer.bookedByStaff", input),
      roleOnly: (input) => t("drawer.bookedByRole", input),
      roleLabel,
    }),
    showCancel: allowCancel && canCancelHistoryBooking(booking),
    showReturn: allowCancel && booking.canReturnPackageCredit === true,
  };
}

export function AdminClientBookingHistoryRow({
  booking,
  locale,
  allowCancel,
  busy,
  onCancel,
  onReturnSuccess,
  onReturnError,
}: AdminClientBookingHistoryRowProps) {
  const t = useTranslations("adminPages.clients");
  const tRoles = useTranslations("dashboard.shell.roles");
  const copy = historyRowCopy({ booking, locale, allowCancel, t, tRoles });

  return (
    <div className="flex items-start gap-2 rounded-xl border border-white/70 bg-white/65 px-3 py-2 text-sm">
      <HistoryCopy booking={booking} copy={copy} guestLabel={t("drawer.guestPass")} />
      <HistoryActions
        booking={booking}
        copy={copy}
        busy={busy}
        cancelLabel={t("bookings.cancelButton")}
        onCancel={onCancel}
        onReturnSuccess={onReturnSuccess}
        onReturnError={onReturnError}
      />
    </div>
  );
}

function HistoryCopy({
  booking,
  copy,
  guestLabel,
}: {
  booking: ClientSheetBookingItem;
  copy: HistoryRowCopy;
  guestLabel: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="font-medium text-sage-900">{booking.session.classType.name}</p>
      <p className="text-xs text-sage-700">{copy.coachLabel}</p>
      {copy.guestName ? (
        <p className="text-xs text-sand-800">
          {guestLabel}: {copy.guestName}
        </p>
      ) : null}
      <p className="text-xs text-sage-600">{copy.meta}</p>
      <p className="mt-1 text-xs text-sage-500">{copy.signedUp}</p>
      {copy.bookedBy !== null ? (
        <BookingBookedByBadge kind={copy.bookedBy.kind} label={copy.bookedBy.label} />
      ) : null}
      {copy.extra !== null ? <p className="text-xs text-sage-500">{copy.extra}</p> : null}
      {copy.cancelledByLabel !== null ? (
        <p className="text-xs font-medium text-rose-700">{copy.cancelledByLabel}</p>
      ) : null}
    </div>
  );
}

function HistoryActions({
  booking,
  copy,
  busy,
  cancelLabel,
  onCancel,
  onReturnSuccess,
  onReturnError,
}: {
  booking: ClientSheetBookingItem;
  copy: HistoryRowCopy;
  busy: boolean;
  cancelLabel: string;
  onCancel: (booking: ClientSheetBookingItem) => void;
  onReturnSuccess: () => void;
  onReturnError: (message: string) => void;
}) {
  if (!copy.showReturn && !copy.showCancel) {
    return null;
  }
  return (
    <div className="flex shrink-0 flex-col items-end gap-2">
      {copy.showReturn ? (
        <AdminClientBookingReturnSessionButton
          bookingId={booking.id}
          disabled={busy}
          onSuccess={onReturnSuccess}
          onError={onReturnError}
        />
      ) : null}
      {copy.showCancel ? (
        <button
          type="button"
          className={CANCEL_BUTTON_CLASS}
          disabled={busy}
          onClick={(event) => {
            event.stopPropagation();
            onCancel(booking);
          }}
        >
          <span>{cancelLabel}</span>
          <BanGlyph className={CANCEL_ICON_CLASS} />
        </button>
      ) : null}
    </div>
  );
}
