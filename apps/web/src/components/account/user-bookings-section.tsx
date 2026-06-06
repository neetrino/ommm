"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
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
  USER_BOOKINGS_LIST_ACTIONS_HEADER_CELL,
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
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { useUserListBoardView } from "@/hooks/use-user-list-board-view";
import { apiFetch } from "@/lib/api";
import {
  parseListPageParams,
  syncListPageQuery,
} from "@/lib/list-pagination";
import type { UserBookingRow, UserWaitlistRow } from "@/lib/user-booking-types";
import {
  buildUserBookingsPastEndpoint,
  USER_BOOKINGS_PAST_PAGE_KEYS,
  type UserBookingsPastPayload,
} from "@/lib/user-bookings-query";

type UserBookingsSectionProps = {
  locale: string;
  initialUpcoming: readonly UserBookingRow[];
  initialPast: UserBookingsPastPayload;
  waitlist: readonly UserWaitlistRow[];
  waitlistLoadError: boolean;
};

export function UserBookingsSection({
  locale,
  initialUpcoming,
  initialPast,
  waitlist,
  waitlistLoadError,
}: UserBookingsSectionProps) {
  const t = useTranslations("userPages.bookings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewMode, setView] = useUserListBoardView("bookings");
  const [pastPayload, setPastPayload] = useState(initialPast);
  const [loadingPast, startPastTransition] = useTransition();
  const pastRequestId = useRef(0);
  const pastHasMounted = useRef(false);

  const pastListPage = useMemo(
    () =>
      parseListPageParams(Object.fromEntries(searchParams.entries()), USER_BOOKINGS_PAST_PAGE_KEYS),
    [searchParams],
  );

  useEffect(() => {
    setPastPayload(initialPast);
  }, [initialPast]);

  useEffect(() => {
    if (!pastHasMounted.current) {
      pastHasMounted.current = true;
      return undefined;
    }

    const nextRequestId = pastRequestId.current + 1;
    pastRequestId.current = nextRequestId;
    startPastTransition(() => {
      void apiFetch<UserBookingsPastPayload>(
        buildUserBookingsPastEndpoint(pastListPage.take, pastListPage.offset),
      )
        .then((payload) => {
          if (pastRequestId.current !== nextRequestId) return;
          setPastPayload(payload);
        })
        .catch(() => {
          if (pastRequestId.current === nextRequestId) {
            setPastPayload({ rows: [], total: 0, take: pastListPage.take, offset: pastListPage.offset });
          }
        });
    });
  }, [pastListPage.offset, pastListPage.take]);

  const setPastListPage = useCallback(
    (page: number, pageSize?: number) => {
      const params = new URLSearchParams(searchParams.toString());
      syncListPageQuery(params, page, pageSize, USER_BOOKINGS_PAST_PAGE_KEYS);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const totalCount = initialUpcoming.length + pastPayload.total;

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
        rows={initialUpcoming}
        viewMode={viewMode}
        showCancel
        emptyLabel={t("emptySection")}
      />

      <BookingGroup
        title={t("pastOther")}
        locale={locale}
        rows={pastPayload.rows}
        viewMode={viewMode}
        showRebook
        emptyLabel={t("emptySection")}
        pagination={
          <OmmListPagination
            namespace="userPages.pagination"
            total={pastPayload.total}
            page={pastListPage.page}
            pageSize={pastListPage.pageSize}
            offset={pastPayload.offset}
            onPageChange={(page) => setPastListPage(page)}
            onPageSizeChange={(pageSize) => setPastListPage(1, pageSize)}
            disabled={loadingPast}
          />
        }
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
  pagination?: ReactNode;
};

function BookingGroup({
  title,
  locale,
  rows,
  viewMode,
  showCancel = false,
  showRebook = false,
  emptyLabel,
  pagination,
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
            <span className={USER_BOOKINGS_LIST_ACTIONS_HEADER_CELL}>{t("listHeaderActions")}</span>
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
      {pagination ? <div className="mt-4">{pagination}</div> : null}
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
            <span className={USER_BOOKINGS_LIST_ACTIONS_HEADER_CELL}>{t("listHeaderActions")}</span>
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
