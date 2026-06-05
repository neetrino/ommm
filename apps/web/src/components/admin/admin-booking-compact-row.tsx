"use client";

import { useTranslations } from "next-intl";
import { AdminBookingRowActions } from "@/components/admin/admin-booking-row-actions";
import { AdminBookingStatusPicker } from "@/components/admin/admin-booking-status-picker";
import {
  ADMIN_BOOKINGS_LIST_ACTIONS_CELL,
  ADMIN_BOOKINGS_LIST_CELL,
  ADMIN_BOOKINGS_LIST_ROW_CLASS,
  ADMIN_BOOKINGS_LIST_SPACER_CELL,
  ADMIN_BOOKINGS_LIST_STATUS_CELL,
} from "@/components/admin/admin-bookings-list-layout";
import { formatPackagePlanName } from "@/components/admin/admin-packages-display";
import { formatDateTimeForUi } from "@/lib/date-display";

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
          className="block max-w-full truncate text-left font-medium text-sage-900 underline-offset-2 hover:underline"
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
        <p className="truncate font-serif text-lg leading-snug tracking-tight text-sage-950">
          {row.session.classType.name}
        </p>
        <p className="mt-0.5 truncate text-xs font-medium text-sage-500">
          {formatDateTimeForUi(row.session.startsAt, locale)}
        </p>
        {row.package !== null ? (
          <p className="mt-0.5 truncate text-xs text-sage-500">
            {formatPackagePlanName(row.package.planName, row.package.sessionsPerMonth)}
          </p>
        ) : null}
      </div>

      <div className={ADMIN_BOOKINGS_LIST_STATUS_CELL}>
        <MobileLabel label={t("colPaymentStatus")} />
        <BookingBadge tone="slate" label={paymentLabel(t, row.paymentStatus)} />
      </div>

      <div className={ADMIN_BOOKINGS_LIST_STATUS_CELL}>
        <MobileLabel label={t("colAttendanceStatus")} />
        <BookingBadge tone="sand" label={attendanceLabel(t, row.attendanceStatus)} />
      </div>

      <div className={ADMIN_BOOKINGS_LIST_STATUS_CELL}>
        <MobileLabel label={t("colChannel")} />
        <BookingBadge
          tone="mint"
          label={row.channel === "APP" ? t("channelApp") : t("channelWebsite")}
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
        className={ADMIN_BOOKINGS_LIST_ACTIONS_CELL}
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
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-sage-500 md:hidden">
      {label}
    </p>
  );
}

function BookingBadge({
  label,
  tone,
}: {
  label: string;
  tone: "slate" | "sand" | "mint" | "indigo";
}) {
  const styles =
    tone === "mint"
      ? "border-mint-200 bg-mint-50 text-sage-900"
      : tone === "indigo"
        ? "border-indigo-200 bg-indigo-50 text-indigo-900"
        : tone === "sand"
          ? "border-sand-300 bg-sand-50 text-sage-900"
          : "border-zinc-200 bg-zinc-50 text-zinc-800";

  return (
    <span
      className={`inline-flex max-w-full shrink-0 truncate rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight ${styles}`}
    >
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

function attendanceLabel(
  t: ReturnType<typeof useTranslations<"adminPages.bookings">>,
  value: BookingRow["attendanceStatus"],
): string {
  if (value === "ATTENDED") return t("attendanceAttended");
  if (value === "NO_SHOW") return t("attendanceNoShow");
  if (value === "LATE_CANCEL") return t("attendanceLateCancel");
  return t("attendanceNotAttended");
}
