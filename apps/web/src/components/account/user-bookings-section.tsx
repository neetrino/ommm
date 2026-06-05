"use client";

import { useTranslations } from "next-intl";
import {
  resolveSessionCoachName,
  SessionCoachLine,
} from "@/components/account/session-coach-line";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import { UserBookingBoardCard } from "@/components/account/user-booking-board-card";
import { UserBookingCompactRow } from "@/components/account/user-booking-compact-row";
import {
  USER_BOOKINGS_LIST_ACTIONS_CELL,
  USER_BOOKINGS_LIST_CLASS_CELL,
  USER_BOOKINGS_LIST_DATE_CELL,
  USER_BOOKINGS_LIST_HEADER_CLASS,
  USER_BOOKINGS_LIST_ROW_CLASS,
  USER_BOOKINGS_LIST_SPACER_CELL,
  USER_BOOKINGS_LIST_STATUS_CELL,
  USER_BOOKINGS_LIST_TIME_CELL,
} from "@/components/account/user-bookings-list-layout";
import { USER_LIST_STACK_CLASS } from "@/components/account/user-list-table-layout";
import { UserListBoardViewSwitcher } from "@/components/account/user-list-board-view-switcher";
import { UserWaitlistBoardCard } from "@/components/account/user-waitlist-board-card";
import { useUserListBoardView } from "@/hooks/use-user-list-board-view";
import type { UserBookingRow, UserWaitlistRow } from "@/lib/user-booking-types";

type UserBookingsSectionProps = {
  locale: string;
  upcoming: readonly UserBookingRow[];
  past: readonly UserBookingRow[];
  waitlist: readonly UserWaitlistRow[];
  waitlistLoadError: boolean;
};

export function UserBookingsSection({
  locale,
  upcoming,
  past,
  waitlist,
  waitlistLoadError,
}: UserBookingsSectionProps) {
  const t = useTranslations("userPages.bookings");
  const [viewMode, setView] = useUserListBoardView("bookings");
  const totalCount = upcoming.length + past.length;

  return (
    <div className="space-y-8">
      {totalCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-sage-600">{t("bookingsCount", { count: totalCount })}</p>
          <UserListBoardViewSwitcher
            pageId="bookings"
            namespace="userPages.bookings"
            value={viewMode}
            onChange={setView}
          />
        </div>
      ) : null}

      <BookingGroup
        title={t("upcoming")}
        locale={locale}
        rows={upcoming}
        viewMode={viewMode}
        showCancel
        emptyLabel={t("emptySection")}
      />

      <BookingGroup
        title={t("pastOther")}
        locale={locale}
        rows={past}
        viewMode={viewMode}
        showRebook
        emptyLabel={t("emptySection")}
      />

      <WaitlistGroup
        locale={locale}
        rows={waitlist}
        viewMode={viewMode}
        loadError={waitlistLoadError}
      />
    </div>
  );
}

type BookingGroupProps = {
  title: string;
  locale: string;
  rows: readonly UserBookingRow[];
  viewMode: "list" | "board";
  showCancel?: boolean;
  showRebook?: boolean;
  emptyLabel: string;
};

function BookingGroup({
  title,
  locale,
  rows,
  viewMode,
  showCancel = false,
  showRebook = false,
  emptyLabel,
}: BookingGroupProps) {
  const t = useTranslations("userPages.bookings");

  return (
    <section>
      <h2 className="ommm-h3 text-sage-800">{title}</h2>
      {rows.length === 0 ? (
        <p className="ommm-body-muted mt-2 text-sm">{emptyLabel}</p>
      ) : viewMode === "board" ? (
        <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((booking) => (
            <li key={booking.id} className="min-w-0 list-none">
              <UserBookingBoardCard
                locale={locale}
                booking={booking}
                showCancel={showCancel}
                showRebook={showRebook}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className={`mt-4 ${USER_LIST_STACK_CLASS}`}>
          <div className={USER_BOOKINGS_LIST_HEADER_CLASS}>
            <span>{t("listHeaderDate")}</span>
            <span>{t("listHeaderClass")}</span>
            <span>{t("listHeaderTime")}</span>
            <span>{t("listHeaderStatus")}</span>
            <span aria-hidden="true" />
            <span>{t("listHeaderActions")}</span>
          </div>
          <ul className={USER_LIST_STACK_CLASS}>
            {rows.map((booking) => (
              <li key={booking.id} className="list-none">
                <UserBookingCompactRow
                  locale={locale}
                  booking={booking}
                  showCancel={showCancel}
                  showRebook={showRebook}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

type WaitlistGroupProps = {
  locale: string;
  rows: readonly UserWaitlistRow[];
  viewMode: "list" | "board";
  loadError: boolean;
};

function WaitlistGroup({ locale, rows, viewMode, loadError }: WaitlistGroupProps) {
  const t = useTranslations("userPages.bookings");

  return (
    <section>
      <h2 className="ommm-h3 text-sage-800">{t("waitlists")}</h2>
      {loadError ? (
        <p className="ommm-body-muted mt-2 text-sm">{t("waitlistsLoadError")}</p>
      ) : rows.length === 0 ? (
        <p className="ommm-body-muted mt-2 text-sm">{t("waitlistsEmpty")}</p>
      ) : viewMode === "board" ? (
        <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((item) => (
            <li key={item.id} className="min-w-0 list-none">
              <UserWaitlistBoardCard locale={locale} waitlist={item} />
            </li>
          ))}
        </ul>
      ) : (
        <div className={`mt-4 ${USER_LIST_STACK_CLASS}`}>
          <div className={USER_BOOKINGS_LIST_HEADER_CLASS}>
            <span>{t("listHeaderDate")}</span>
            <span>{t("listHeaderClass")}</span>
            <span>{t("listHeaderTime")}</span>
            <span>{t("listHeaderStatus")}</span>
            <span aria-hidden="true" />
            <span>{t("listHeaderActions")}</span>
          </div>
          <ul className={USER_LIST_STACK_CLASS}>
            {rows.map((item) => (
              <li key={item.id} className={`list-none ${USER_BOOKINGS_LIST_ROW_CLASS}`}>
                <div className={USER_BOOKINGS_LIST_DATE_CELL}>
                  <SessionDateTimeHighlight
                    locale={locale}
                    startsAt={item.session.startsAt}
                    endsAt={item.session.endsAt}
                    variant="listDate"
                  />
                </div>
                <div className={USER_BOOKINGS_LIST_CLASS_CELL}>
                  <SessionClassTitle variant="list" name={item.session.classType.name} />
                  <SessionCoachLine
                    coachName={resolveSessionCoachName(item.session.coach)}
                    variant="list"
                    className="mt-1"
                  />
                </div>
                <div className={USER_BOOKINGS_LIST_TIME_CELL}>
                  <SessionDateTimeHighlight
                    locale={locale}
                    startsAt={item.session.startsAt}
                    endsAt={item.session.endsAt}
                    variant="listTime"
                  />
                </div>
                <div className={USER_BOOKINGS_LIST_STATUS_CELL}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-sage-500">
                    {t("waitlistBadge", { pos: item.position, status: item.status })}
                  </p>
                </div>
                <div className={USER_BOOKINGS_LIST_SPACER_CELL} aria-hidden="true" />
                <div className={USER_BOOKINGS_LIST_ACTIONS_CELL} aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
