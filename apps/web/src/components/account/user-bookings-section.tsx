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
  USER_BOOKINGS_LIST_TABLE_CLASS,
} from "@/components/account/user-bookings-list-layout";
import { UserBookingsTabNav } from "@/components/account/user-bookings-tab-nav";
import { UserListBoardViewSwitcher } from "@/components/account/user-list-board-view-switcher";
import { UserSheetPageFiltersBar } from "@/components/account/user-sheet-page-filters-bar";
import { UserViewContentEnter } from "@/components/account/user-view-content-enter";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { useUserListBoardView } from "@/hooks/use-user-list-board-view";
import { usePropSyncedState } from "@/hooks/use-prop-synced-state";
import { useRealtimeRefetch } from "@/hooks/use-realtime-refetch";
import { apiFetch } from "@/lib/api";
import { REALTIME_REFETCH_KEYS } from "@/lib/realtime/realtime-refetch-keys";
import {
  parseListPageParams,
  resetListPageQuery,
  syncListPageQuery,
} from "@/lib/list-pagination";
import { parseSessionSortOrder, sortBySessionStartsAt, type SessionSortOrder } from "@/lib/list-sort";
import {
  readUserListOrderFromSearch,
  syncUserListOrderQuery,
} from "@/lib/user-list-order-url";
import type { UserBookingRow } from "@/lib/user-booking-types";
import {
  buildUserBookingsPastEndpoint,
  buildUserBookingsUpcomingEndpoint,
  USER_BOOKINGS_PAST_PAGE_KEYS,
  type UserBookingsPastPayload,
} from "@/lib/user-bookings-query";
import { parseUserBookingsTab } from "@/lib/user-bookings-tab";

type UserBookingsSectionProps = {
  locale: string;
  initialUpcoming: readonly UserBookingRow[];
  initialPast: UserBookingsPastPayload;
  embeddedInSheet?: boolean;
};

export function UserBookingsSection({
  locale,
  initialUpcoming,
  initialPast,
  embeddedInSheet = false,
}: UserBookingsSectionProps) {
  const t = useTranslations("userPages.bookings");
  const tSort = useTranslations("listSort");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewMode, setView] = useUserListBoardView("bookings");
  const [upcomingRows, setUpcomingRows] = usePropSyncedState(initialUpcoming);
  const [pastPayload, setPastPayload] = usePropSyncedState(initialPast);
  const [filters, setFilters] = useState<UserBookingFilterValues>(() => ({
    ...DEFAULT_USER_BOOKING_FILTER_VALUES,
    order: readUserListOrderFromSearch(
      Object.fromEntries(searchParams.entries()),
      "session",
      "upcoming",
    ),
  }));
  const [loadingPast, startPastTransition] = useTransition();
  const pastRequestId = useRef(0);
  const pastHasMounted = useRef(false);

  const pastListPage = useMemo(
    () =>
      parseListPageParams(Object.fromEntries(searchParams.entries()), USER_BOOKINGS_PAST_PAGE_KEYS),
    [searchParams],
  );

  const replaceSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutator(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (!pastHasMounted.current) {
      pastHasMounted.current = true;
      return undefined;
    }

    const nextRequestId = pastRequestId.current + 1;
    pastRequestId.current = nextRequestId;
    startPastTransition(() => {
      void apiFetch<UserBookingsPastPayload>(
        buildUserBookingsPastEndpoint(
          pastListPage.take,
          pastListPage.offset,
          filters.order,
        ),
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
  }, [filters.order, pastListPage, setPastPayload]);

  const refetchUpcoming = useCallback(async () => {
    try {
      const rows = await apiFetch<UserBookingRow[]>(
        buildUserBookingsUpcomingEndpoint(filters.order),
      );
      setUpcomingRows(rows);
    } catch {
      // Keep current rows on transient errors.
    }
  }, [filters.order, setUpcomingRows]);

  useRealtimeRefetch(REALTIME_REFETCH_KEYS.BOOKINGS_ME, () => {
    void refetchUpcoming();
  });

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
    () => extractUserBookingFilterOptions([...upcomingRows, ...pastPayload.rows]),
    [upcomingRows, pastPayload.rows],
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
          sort: tSort("sort"),
          sortUpcoming: tSort("upcoming"),
          sortDateAsc: tSort("dateAsc"),
          sortDateDesc: tSort("dateDesc"),
        },
      }),
    [filterOptions.classTypes, filterOptions.coaches, t, tSort],
  );

  const integratedFilterValues = useMemo(
    () => userBookingsIntegratedFilterValues(filters),
    [filters],
  );

  const filteredUpcoming = useMemo(
    () =>
      sortBySessionStartsAt(
        upcomingRows.filter((row) => matchesUserBookingFilters(row, filters)),
        (row) => row.session.startsAt,
        filters.order,
      ),
    [filters, upcomingRows],
  );

  const filteredPast = useMemo(
    () =>
      sortBySessionStartsAt(
        pastPayload.rows.filter((row) => matchesUserBookingFilters(row, filters)),
        (row) => row.session.startsAt,
        filters.order,
      ),
    [filters, pastPayload.rows],
  );

  const activeTab = parseUserBookingsTab(Object.fromEntries(searchParams.entries()));
  const isPastTab = activeTab === "past";
  const tabRows = isPastTab ? filteredPast : filteredUpcoming;
  const filtersActive = hasActiveUserBookingFilters(filters);
  const tabTotalCount = isPastTab
    ? filtersActive
      ? filteredPast.length
      : pastPayload.total
    : filtersActive
      ? filteredUpcoming.length
      : upcomingRows.length;
  const tabHasBookings = isPastTab ? pastPayload.total > 0 : upcomingRows.length > 0;

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
      case "order":
        setFilters((current) => ({
          ...current,
          order: parseSessionSortOrder(value) as SessionSortOrder,
        }));
        replaceSearchParams((params) => {
          resetListPageQuery(params, USER_BOOKINGS_PAST_PAGE_KEYS);
          syncUserListOrderQuery(params, value, "upcoming");
        });
        break;
      default:
        break;
    }
  }

  function resetFilters(): void {
    setFilters(DEFAULT_USER_BOOKING_FILTER_VALUES);
    replaceSearchParams((params) => {
      resetListPageQuery(params, USER_BOOKINGS_PAST_PAGE_KEYS);
      params.delete("order");
    });
  }

  const heroSearch = (
    <UserSheetPageFiltersBar
      embeddedInSheet={embeddedInSheet}
      search={
        <ListPageSearchFilters
          className="w-full min-w-0"
          search={filters.search}
          onSearchChange={(value) => setFilters((current) => ({ ...current, search: value }))}
          searchPlaceholder={t("filters.searchPlaceholder")}
          fields={filterFields}
          filterValues={integratedFilterValues}
          onFilterChange={handleIntegratedFilterChange}
          onClearAll={resetFilters}
          resetLabel={t("filters.resetFilters")}
        />
      }
      trailing={
        <UserListBoardViewSwitcher
          pageId="bookings"
          namespace="userPages.bookings"
          value={viewMode}
          onChange={setView}
        />
      }
    />
  );

  const tabEmptyTitle = isPastTab ? t("emptyPastTitle") : t("emptyPerfectTitle");
  const tabEmptyDescription = isPastTab ? t("emptyPastDescription") : t("emptyPerfectDescription");

  const listBody = !tabHasBookings && !filtersActive ? (
    <section className="rounded-[20px] border border-white/60 bg-white/75 p-5 sm:p-6">
      <h2 className="ommm-h3 text-sage-800">{tabEmptyTitle}</h2>
      <p className="ommm-body-muted mt-2 text-sm">{tabEmptyDescription}</p>
    </section>
  ) : (
    <>
      {tabTotalCount > 0 ? (
        <p className="text-sm text-sage-600">{t("bookingsCount", { count: tabTotalCount })}</p>
      ) : (
        <div className="rounded-2xl border border-sage-100 bg-white/80 p-5 text-sm">
          <p className="font-medium text-sage-900">{t("filteredEmptyTitle")}</p>
          <p className="mt-1 text-sage-600">{t("filteredEmptyDescription")}</p>
        </div>
      )}

      <BookingGroup
        locale={locale}
        rows={tabRows}
        viewMode={viewMode}
        showCancel={!isPastTab}
        showRebook={isPastTab}
        emptyLabel={filtersActive ? t("filteredEmptySection") : tabEmptyDescription}
        pagination={
          isPastTab ? (
            <OmmListPagination
              namespace="userPages.pagination"
              total={pastPayload.total}
              page={pastListPage.page}
              pageSize={pastListPage.pageSize}
              offset={pastPayload.offset}
              onPageChange={(page) => setPastListPage(page)}
              disabled={loadingPast}
            />
          ) : undefined
        }
      />
    </>
  );

  return (
    <div className="space-y-4">
      {embeddedInSheet ? (
        heroSearch
      ) : (
        <AdminPageHero title={t("title")} search={heroSearch} />
      )}
      <UserBookingsTabNav />
      <UserViewContentEnter viewKey={`${activeTab}-${viewMode}`}>{listBody}</UserViewContentEnter>
    </div>
  );
}

type BookingGroupProps = {
  locale: string;
  rows: readonly UserBookingRow[];
  viewMode: "list" | "board";
  showCancel?: boolean;
  showRebook?: boolean;
  emptyLabel: string;
  pagination?: ReactNode;
};

function BookingGroup({
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
      {rows.length === 0 ? (
        <p className="ommm-body-muted text-sm">{emptyLabel}</p>
      ) : viewMode === "board" ? (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
        <div className={USER_BOOKINGS_LIST_TABLE_CLASS}>
          <div className={USER_BOOKINGS_LIST_HEADER_CLASS}>
            <span>{t("listHeaderDate")}</span>
            <span>{t("listHeaderClass")}</span>
            <span>{t("listHeaderTime")}</span>
            <span>{t("listHeaderStatus")}</span>
            <span className={USER_BOOKINGS_LIST_ACTIONS_HEADER_CELL}>{t("listHeaderActions")}</span>
          </div>
          {rows.map((booking) => (
            <UserBookingCompactRow
              key={booking.id}
              locale={locale}
              booking={booking}
              showCancel={showCancel}
              showRebook={showRebook}
            />
          ))}
        </div>
      )}
      {pagination ? <div className="mt-4">{pagination}</div> : null}
    </section>
  );
}
