"use client";

import { useTranslations } from "next-intl";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import { AdminBookingRowActions } from "@/components/admin/admin-booking-row-actions";
import { AdminBookingStatusPicker } from "@/components/admin/admin-booking-status-picker";
import { normalizeBookingStatusBadgePaymentMethod } from "@/components/admin/admin-booking-list-badges";
import {
  ADMIN_BOOKINGS_LIST_ACTIONS_AREA_CLASS,
  ADMIN_BOOKINGS_LIST_ACTIONS_CELL,
  ADMIN_BOOKINGS_LIST_BOOKING_STATUS_CELL,
  ADMIN_BOOKINGS_LIST_CLASS_AREA_CLASS,
  ADMIN_BOOKINGS_LIST_COACH_AREA_CLASS,
  ADMIN_BOOKINGS_LIST_COACH_CELL,
  ADMIN_BOOKINGS_LIST_COACH_MOBILE_CLASS,
  ADMIN_BOOKINGS_LIST_DATETIME_AREA_CLASS,
  ADMIN_BOOKINGS_LIST_DATE_TIME_CELL,
  ADMIN_BOOKINGS_LIST_PACKAGE_CLASS,
  ADMIN_BOOKINGS_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_BOOKINGS_LIST_STATUS_AREA_CLASS,
  ADMIN_BOOKINGS_LIST_SUBTITLE_CLASS,
  ADMIN_BOOKINGS_LIST_TITLE_CLASS,
  ADMIN_BOOKINGS_LIST_USER_AREA_CLASS,
  ADMIN_BOOKINGS_LIST_USER_CELL,
} from "@/components/admin/admin-bookings-list-layout";
import { ADMIN_LIST_TITLE_TEXT_CLASS } from "@/components/admin/admin-list-table-layout";
import { formatPackagePlanName } from "@/components/admin/admin-packages-display";
import type { AdminBookingRow } from "@/components/admin/admin-bookings-query";
import { displayPhoneOrFallback } from "@/lib/phone";

type BookingCardFieldsProps = {
  locale: string;
  row: AdminBookingRow;
  busy: boolean;
  userLabel: string;
  coachName: string | undefined;
  coachLabel: string;
  onOpenUser: (userId: string) => void;
  onEdit: () => void;
  onMove: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
  onChangeStatus: (status: AdminBookingRow["status"]) => void;
};

export function BookingCardFields({
  locale,
  row,
  busy,
  userLabel,
  coachName,
  coachLabel,
  onOpenUser,
  onEdit,
  onMove,
  onDeactivate,
  onActivate,
  onChangeStatus,
}: BookingCardFieldsProps) {
  return (
    <>
      <BookingUserCell
        row={row}
        userLabel={userLabel}
        coachName={coachName}
        coachLabel={coachLabel}
        onOpenUser={onOpenUser}
      />
      <BookingCoachCell coachName={coachName} coachLabel={coachLabel} />
      <BookingClassCell row={row} />
      <BookingDateTimeCell locale={locale} row={row} />
      <BookingStatusCell row={row} busy={busy} onChangeStatus={onChangeStatus} />
      <BookingActionsCell
        row={row}
        busy={busy}
        onEdit={onEdit}
        onMove={onMove}
        onDeactivate={onDeactivate}
        onActivate={onActivate}
      />
    </>
  );
}

function BookingUserCell({
  row,
  userLabel,
  coachName,
  coachLabel,
  onOpenUser,
}: {
  row: AdminBookingRow;
  userLabel: string;
  coachName: string | undefined;
  coachLabel: string;
  onOpenUser: (userId: string) => void;
}) {
  const t = useTranslations("adminPages.bookings");

  return (
    <div className={`${ADMIN_BOOKINGS_LIST_USER_CELL} ${ADMIN_BOOKINGS_LIST_USER_AREA_CLASS}`}>
      <button
        type="button"
        className={ADMIN_BOOKINGS_LIST_TITLE_CLASS}
        onClick={(event) => {
          event.stopPropagation();
          onOpenUser(row.user.id);
        }}
      >
        {userLabel}
      </button>
      {row.guestName ? (
        <p className={ADMIN_BOOKINGS_LIST_SUBTITLE_CLASS}>
          {t("guestPass")}: {row.guestName}
        </p>
      ) : null}
      <p className={ADMIN_BOOKINGS_LIST_SUBTITLE_CLASS}>{displayPhoneOrFallback(row.user.phone)}</p>
      <p className={`${ADMIN_BOOKINGS_LIST_COACH_MOBILE_CLASS} md:hidden`}>
        {coachName ? t("withCoach", { name: coachLabel }) : coachLabel}
      </p>
    </div>
  );
}

function BookingCoachCell({
  coachName,
  coachLabel,
}: {
  coachName: string | undefined;
  coachLabel: string;
}) {
  return (
    <div className={`${ADMIN_BOOKINGS_LIST_COACH_CELL} ${ADMIN_BOOKINGS_LIST_COACH_AREA_CLASS}`}>
      <p
        className={`${ADMIN_LIST_TITLE_TEXT_CLASS} ${coachName ? "text-sage-900" : "text-sage-500"}`}
      >
        {coachLabel}
      </p>
    </div>
  );
}

function BookingClassCell({ row }: { row: AdminBookingRow }) {
  return (
    <div className={`${ADMIN_BOOKINGS_LIST_USER_CELL} ${ADMIN_BOOKINGS_LIST_CLASS_AREA_CLASS}`}>
      <SessionClassTitle variant="list" name={row.session.classType.name} />
      {row.package !== null ? (
        <p className={ADMIN_BOOKINGS_LIST_PACKAGE_CLASS}>
          {formatPackagePlanName(row.package.planName, row.package.sessionsPerMonth)}
        </p>
      ) : null}
    </div>
  );
}

function BookingDateTimeCell({ locale, row }: { locale: string; row: AdminBookingRow }) {
  return (
    <div className={`${ADMIN_BOOKINGS_LIST_DATE_TIME_CELL} ${ADMIN_BOOKINGS_LIST_DATETIME_AREA_CLASS}`}>
      <div className="flex min-w-0 items-center gap-3 md:justify-center">
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
  );
}

function BookingStatusCell({
  row,
  busy,
  onChangeStatus,
}: {
  row: AdminBookingRow;
  busy: boolean;
  onChangeStatus: (status: AdminBookingRow["status"]) => void;
}) {
  return (
    <div
      className={`${ADMIN_BOOKINGS_LIST_BOOKING_STATUS_CELL} ${ADMIN_BOOKINGS_LIST_STATUS_AREA_CLASS}`}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <AdminBookingStatusPicker
        recordType={row.recordType}
        status={row.status}
        bookingPaymentMethod={normalizeBookingStatusBadgePaymentMethod(
          row.bookingPaymentMethod,
        )}
        busy={busy}
        onChangeStatus={onChangeStatus}
      />
    </div>
  );
}

function BookingActionsCell({
  row,
  busy,
  onEdit,
  onMove,
  onDeactivate,
  onActivate,
}: {
  row: AdminBookingRow;
  busy: boolean;
  onEdit: () => void;
  onMove: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
}) {
  return (
    <div
      className={`${ADMIN_BOOKINGS_LIST_ACTIONS_CELL} ${ADMIN_BOOKINGS_LIST_ACTIONS_AREA_CLASS} ${ADMIN_BOOKINGS_LIST_ROW_ACTIONS_HOVER_REVEAL}`}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
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
  );
}
