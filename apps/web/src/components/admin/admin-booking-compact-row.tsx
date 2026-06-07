"use client";

import { useTranslations } from "next-intl";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import {
  ADMIN_BOOKING_VALUE_BADGE_CLASS,
  paymentValueBadgeTone,
} from "@/components/admin/admin-booking-list-badges";
import { AdminBookingRowActions } from "@/components/admin/admin-booking-row-actions";
import { AdminBookingStatusPicker } from "@/components/admin/admin-booking-status-picker";
import {
  ADMIN_BOOKINGS_LIST_ACTIONS_CELL,
  ADMIN_BOOKINGS_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_BOOKINGS_LIST_CELL,
  ADMIN_BOOKINGS_LIST_DATE_TIME_CELL,
  ADMIN_BOOKINGS_LIST_ROW_CLASS,
  ADMIN_BOOKINGS_LIST_BOOKING_STATUS_CELL,
  ADMIN_BOOKINGS_LIST_PAYMENT_CELL,
} from "@/components/admin/admin-bookings-list-layout";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { ADMIN_LIST_TITLE_LINK_CLASS } from "@/components/admin/admin-list-table-layout";
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
  onEdit: () => void;
  onMove: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
  onChangeStatus: (status: BookingRow["status"]) => void;
};

export function AdminBookingCompactRow({
  locale,
  row,
  busy,
  onOpenDetails,
  onOpenUser,
  onEdit,
  onMove,
  onDeactivate,
  onActivate,
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
        <AdminListMobileLabel label={t("colUserPhone")} />
        <button
          type="button"
          className={ADMIN_LIST_TITLE_LINK_CLASS}
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
        <AdminListMobileLabel label={t("colClassType")} />
        <SessionClassTitle variant="list" name={row.session.classType.name} />
        {row.package !== null ? (
          <p className="mt-1 truncate text-[11px] text-sage-500">
            {formatPackagePlanName(row.package.planName, row.package.sessionsPerMonth)}
          </p>
        ) : null}
      </div>

      <div className={ADMIN_BOOKINGS_LIST_DATE_TIME_CELL}>
        <AdminListMobileLabel label={t("colDateTime")} />
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

      <div className={ADMIN_BOOKINGS_LIST_PAYMENT_CELL}>
        <AdminListMobileLabel label={t("colPaymentStatus")} />
        <BookingValueBadge
          label={paymentLabel(t, row.paymentStatus)}
          className={paymentValueBadgeTone(row.paymentStatus)}
        />
      </div>

      <div
        className={ADMIN_BOOKINGS_LIST_BOOKING_STATUS_CELL}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <AdminListMobileLabel label={t("colStatus")} />
        <AdminBookingStatusPicker
          recordType={row.recordType}
          status={row.status}
          busy={busy}
          onChangeStatus={onChangeStatus}
        />
      </div>

      <div
        className={`${ADMIN_BOOKINGS_LIST_ACTIONS_CELL} ${ADMIN_BOOKINGS_LIST_ROW_ACTIONS_HOVER_REVEAL}`}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <AdminListMobileLabel label={t("colActions")} />
        <AdminBookingRowActions
          variant="list"
          recordType={row.recordType}
          status={row.status}
          busy={busy}
          onEdit={onEdit}
          onMove={onMove}
          onDeactivate={onDeactivate}
          onActivate={onActivate}
        />
      </div>
    </article>
  );
}

function BookingValueBadge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`${ADMIN_BOOKING_VALUE_BADGE_CLASS} ${className}`}>
      {label}
    </span>
  );
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
