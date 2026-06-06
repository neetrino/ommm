"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { UserBookingBoardCard } from "@/components/account/user-booking-board-card";
import { UserBookingCompactRow } from "@/components/account/user-booking-compact-row";
import {
  buildUserBookingsFilterFields,
  DEFAULT_USER_BOOKING_FILTER_VALUES,
  extractUserBookingFilterOptions,
  hasActiveUserBookingFilters,
  matchesUserBookingFilters,
  userBookingsIntegratedFilterValues,
  type UserBookingFilterValues,
  type UserBookingStatusFilter,
} from "@/components/account/user-bookings-filter-fields";
import {
  USER_BOOKINGS_LIST_ACTIONS_HEADER_CELL,
  USER_BOOKINGS_LIST_HEADER_CLASS,
} from "@/components/account/user-bookings-list-layout";
import { USER_LIST_STACK_CLASS } from "@/components/account/user-list-table-layout";
import { UserListBoardViewSwitcher } from "@/components/account/user-list-board-view-switcher";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { useUserListBoardView } from "@/hooks/use-user-list-board-view";
import { apiFetch } from "@/lib/api";
import {
  parseListPageParams,
  syncListPageQuery,
} from "@/lib/list-pagination";
import type { UserBookingRow } from "@/lib/user-booking-types";
import {
  buildUserBookingsPastEndpoint,
  USER_BOOKINGS_PAST_PAGE_KEYS,
  type UserBookingsPastPayload,
} from "@/lib/user-bookings-query";

type UserBookingsSectionProps = {
  locale: string;
  initialUpcoming: readonly UserBookingRow[];
  initialPast: UserBookingsPastPayload;
};

export function UserBookingsSection({
  locale,
  initialUpcoming,
  initialPast,
}: UserBookingsSectionProps) {
  const t = useTranslations("userPages.bookings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewMode, setView] = useUserListBoardView("bookings");
  const [pastPayload, setPastPayload] = useState(initialPast);
  const [filters, setFilters] = useState<UserBookingFilterValues>(DEFAULT_USER_BOOKING_FILTER_VALUES);
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

  const filterOptions = useMemo(
    () => extractUserBookingFilterOptions([...initialUpcoming, ...pastPayload.rows]),
    [initialUpcoming, pastPayload.rows],
  );

  const filterFields = useMemo(
    () =>
      buildUserBookingsFilterFields({
        classTypes: filterOptions.classTypes,
        coaches: filterOptions.coaches,
        labels: {
          dateFrom: t("filters.dateFrom"),
          dateTo: t("filters.dateTo"),
          classAll: t("filters.classAll"),
          coachAll: t("filters.coachAll"),
          status: t("filters.status"),
          statusAll: t("filters.statusAll"),
          statusValues: {
            BOOKED: t("status.BOOKED"),
            COMPLETED: t("status.COMPLETED"),
            CANCELLED: t("status.CANCELLED"),
            MISSED: t("status.MISSED"),
          },
          searchPlaceholder: t("filters.searchPlaceholder"),
          resetFilters: t("filters.resetFilters"),
        },
      }),
    [filterOptions.classTypes, filterOptions.coaches, t],
  );

  const integratedFilterValues = useMemo(
    () => userBookingsIntegratedFilterValues(filters),
    [filters],
  );

  const filteredUpcoming = useMemo(
    () => initialUpcoming.filter((row) => matchesUserBookingFilters(row, filters)),
    [filters, initialUpcoming],
  );

  const filteredPast = useMemo(
    () => pastPayload.rows.filter((row) => matchesUserBookingFilters(row, filters)),
    [filters, pastPayload.rows],
  );

  const filtersActive = hasActiveUserBookingFilters(filters);
  const totalCount = filtersActive
    ? filteredUpcoming.length + filteredPast.length
    : initialUpcoming.length + pastPayload.total;
  const hasAnyBookings = initialUpcoming.length > 0 || pastPayload.total > 0;

  function handleIntegratedFilterChange(key: string, value: string): void {
    switch (key) {
      case "from":
        setFilters((current) => ({ ...current, from: value }));
        break;
      case "to":
        setFilters((current) => ({ ...current, to: value }));
        break;
      case "classType":
        setFilters((current) => ({ ...current, classType: value }));
        break;
      case "coach":
        setFilters((current) => ({ ...current, coach: value }));
        break;
      case "status":
        setFilters((current) => ({ ...current, status: value as UserBookingStatusFilter }));
        break;
      default:
        break;
    }
  }

  function resetFilters(): void {
    setFilters(DEFAULT_USER_BOOKING_FILTER_VALUES);
  }

  const heroSearch = (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <ListPageSearchFilters
        search={filters.search}
        onSearchChange={(value) => setFilters((current) => ({ ...current, search: value }))}
        searchPlaceholder={t("filters.searchPlaceholder")}
        fields={filterFields}
        filterValues={integratedFilterValues}
        onFilterChange={handleIntegratedFilterChange}
        onClearAll={resetFilters}
        resetLabel={t("filters.resetFilters")}
      />
      <UserListBoardViewSwitcher
        pageId="bookings"
        namespace="userPages.bookings"
        value={viewMode}
        onChange={setView}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <AdminPageHero title={t("title")} search={heroSearch} />

      {!hasAnyBookings ? (
        <section className="rounded-[20px] border border-white/60 bg-white/75 p-5 sm:p-6">
          <h2 className="ommm-h3 text-sage-800">{t("emptyTitle")}</h2>
          <p className="ommm-body-muted mt-2 text-sm">{t("emptyDescription")}</p>
        </section>
      ) : (
        <>
          {totalCount > 0 ? (
            <p className="text-sm text-sage-600">{t("bookingsCount", { count: totalCount })}</p>
          ) : (
            <div className="rounded-2xl border border-sage-100 bg-white/80 p-5 text-sm">
              <p className="font-medium text-sage-900">{t("filteredEmptyTitle")}</p>
              <p className="mt-1 text-sage-600">{t("filteredEmptyDescription")}</p>
            </div>
          )}

          <BookingGroup
            title={t("upcoming")}
            locale={locale}
            rows={filteredUpcoming}
            viewMode={viewMode}
            showCancel
            emptyLabel={filtersActive ? t("filteredEmptySection") : t("emptySection")}
          />

          <BookingGroup
            title={t("pastOther")}
            locale={locale}
            rows={filteredPast}
            viewMode={viewMode}
            showRebook
            emptyLabel={filtersActive ? t("filteredEmptySection") : t("emptySection")}
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
        </>
      )}
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
