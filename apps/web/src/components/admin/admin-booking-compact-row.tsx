"use client";

import { useTranslations } from "next-intl";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import { AdminBookingRowActions } from "@/components/admin/admin-booking-row-actions";
import { AdminBookingStatusPicker } from "@/components/admin/admin-booking-status-picker";
import {
  ADMIN_BOOKINGS_LIST_ACTIONS_CELL,
  ADMIN_BOOKINGS_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_BOOKINGS_LIST_CELL,
  ADMIN_BOOKINGS_LIST_DATE_TIME_CELL,
  ADMIN_BOOKINGS_LIST_ROW_CLASS,
  ADMIN_BOOKINGS_LIST_SPACER_CELL,
  ADMIN_BOOKINGS_LIST_STATUS_CELL,
  ADMIN_BOOKINGS_LIST_VALUE_BADGE_CLASS,
} from "@/components/admin/admin-bookings-list-layout";
import { formatPackagePlanName } from "@/components/admin/admin-packages-display";

type BookingRow = {
  id: string;
  recordType: "BOOKING" | "WAITLIST";
  status: "BOOKED" | "COMPLETED" | "CANCELLED" | "MISSED" | "WAITLISTED";
  attendanceStatus: "ATTENDED" | "NOT_ATTENDED" | "NO_SHOW" | "LATE_CANCEL" | null;
  paymentStatus: "PAID" | "CASH" | "UNPAID" | "REFUNDED";
  channel: "WEBSITE" | "APP";
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
};

type AdminBookingCompactRowProps = {
  locale: string;
  row: BookingRow;
  busy: boolean;
  onOpenDetails: () => void;
  onOpenUser: (userId: string) => void;
  onMarkAttended: () => void;
  onCancel: () => void;
  onChangeStatus: (status: BookingRow["status"]) => void;
};

export function AdminBookingCompactRow({
  locale,
  row,
  busy,
  onOpenDetails,
  onOpenUser,
  onMarkAttended,
  onCancel,
  onChangeStatus,
}: AdminBookingCompactRowProps) {
  const t = useTranslations("adminPages.bookings");
  const userLabel = row.user.name ?? row.user.email;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={t("viewDetailsFor", { name: userLabel })}
      onClick={onOpenDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails();
        }
      }}
      className={ADMIN_BOOKINGS_LIST_ROW_CLASS}
    >
      <div className={ADMIN_BOOKINGS_LIST_CELL}>
        <MobileLabel label={t("colUserPhone")} />
        <button
          type="button"
          className="block max-w-full truncate text-left text-sm font-medium text-sage-900 underline-offset-2 hover:underline"
          title={userLabel}
          onClick={(event) => {
            event.stopPropagation();
            onOpenUser(row.user.id);
          }}
        >
          {userLabel}
        </button>
        <p className="mt-0.5 truncate text-xs text-sage-500">{row.user.phone ?? "—"}</p>
      </div>

      <div className={ADMIN_BOOKINGS_LIST_CELL}>
        <MobileLabel label={t("colClassType")} />
        <SessionClassTitle variant="list" name={row.session.classType.name} />
        {row.package !== null ? (
          <p className="mt-1 truncate text-[11px] text-sage-500">
            {formatPackagePlanName(row.package.planName, row.package.sessionsPerMonth)}
          </p>
        ) : null}
      </div>

      <div className={ADMIN_BOOKINGS_LIST_DATE_TIME_CELL}>
        <MobileLabel label={t("colDateTime")} />
        <div className="flex min-w-0 items-center gap-3">
          <SessionDateTimeHighlight
            locale={locale}
            startsAt={row.session.startsAt}
            endsAt={row.session.endsAt}
            variant="listDate"
          />
          <SessionDateTimeHighlight
            locale={locale}
            startsAt={row.session.startsAt}
            endsAt={row.session.endsAt}
            variant="listTime"
          />
        </div>
      </div>

      <div className={ADMIN_BOOKINGS_LIST_STATUS_CELL}>
        <MobileLabel label={t("colPaymentStatus")} />
        <BookingValueBadge
          label={paymentLabel(t, row.paymentStatus)}
          className={paymentBadgeClass(row.paymentStatus)}
        />
      </div>

      <div className={ADMIN_BOOKINGS_LIST_STATUS_CELL}>
        <MobileLabel label={t("colAttendanceStatus")} />
        <BookingValueBadge
          label={attendanceLabel(t, row.attendanceStatus)}
          className={attendanceBadgeClass(row.attendanceStatus)}
        />
      </div>

      <div
        className={ADMIN_BOOKINGS_LIST_STATUS_CELL}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <MobileLabel label={t("colStatus")} />
        <AdminBookingStatusPicker
          recordType={row.recordType}
          status={row.status}
          busy={busy}
          onChangeStatus={onChangeStatus}
        />
      </div>

      <div className={ADMIN_BOOKINGS_LIST_SPACER_CELL} aria-hidden="true" />

      <div
        className={`${ADMIN_BOOKINGS_LIST_ACTIONS_CELL} ${ADMIN_BOOKINGS_LIST_ROW_ACTIONS_HOVER_REVEAL}`}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <MobileLabel label={t("colActions")} />
        <AdminBookingRowActions
          variant="list"
          recordType={row.recordType}
          status={row.status}
          busy={busy}
          onMarkAttended={onMarkAttended}
          onCancel={onCancel}
        />
      </div>
    </article>
  );
}

function MobileLabel({ label }: { label: string }) {
  return (
    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-sage-600 md:hidden">
      {label}
    </p>
  );
}

function BookingValueBadge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`${ADMIN_BOOKINGS_LIST_VALUE_BADGE_CLASS} ${className}`}>
      {label}
    </span>
  );
}

function paymentBadgeClass(value: BookingRow["paymentStatus"]): string {
  if (value === "PAID") return "border-mint-200 bg-mint-100 text-mint-900";
  if (value === "CASH") return "border-sand-300 bg-sand-100 text-sand-800";
  if (value === "REFUNDED") return "border-slate-200 bg-slate-100 text-slate-700";
  return "border-amber-200 bg-amber-100 text-amber-900";
}

function attendanceBadgeClass(value: BookingRow["attendanceStatus"]): string {
  if (value === "ATTENDED") return "border-mint-200 bg-mint-100 text-mint-900";
  if (value === "NO_SHOW") return "border-red-200 bg-red-100 text-red-800";
  if (value === "LATE_CANCEL") return "border-sand-300 bg-sand-100 text-sand-800";
  return "border-zinc-200 bg-zinc-100 text-zinc-700";
}

function paymentLabel(
  t: ReturnType<typeof useTranslations<"adminPages.bookings">>,
  value: BookingRow["paymentStatus"],
): string {
  if (value === "PAID") return t("paymentPaid");
  if (value === "CASH") return t("paymentCash");
  if (value === "REFUNDED") return t("paymentRefunded");
  return t("paymentUnpaid");
}

function attendanceLabel(
  t: ReturnType<typeof useTranslations<"adminPages.bookings">>,
  value: BookingRow["attendanceStatus"],
): string {
  if (value === "ATTENDED") return t("attendanceAttended");
  if (value === "NO_SHOW") return t("attendanceNoShow");
  if (value === "LATE_CANCEL") return t("attendanceLateCancel");
  return t("attendanceNotAttended");
}
