"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  resolveSessionCoachName,
  SessionCoachLine,
} from "@/components/account/session-coach-line";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import { UserListBoardViewSwitcher } from "@/components/account/user-list-board-view-switcher";
import { UserSheetPageFiltersBar } from "@/components/account/user-sheet-page-filters-bar";
import { UserViewContentEnter } from "@/components/account/user-view-content-enter";
import {
  buildUserSessionFilterFields,
  DEFAULT_USER_SESSION_FILTER_VALUES,
  extractSessionFilterOptions,
  hasActiveUserSessionFilters,
  matchesUserWaitlistFilters,
  userSessionIntegratedFilterValues,
  type UserSessionFilterValues,
} from "@/components/account/user-session-filters";
import { UserWaitlistBoardCard } from "@/components/account/user-waitlist-board-card";
import {
  USER_BOOKINGS_LIST_ACTIONS_CELL,
  USER_BOOKINGS_LIST_ACTIONS_HEADER_CELL,
  USER_BOOKINGS_LIST_CLASS_CELL,
  USER_BOOKINGS_LIST_DATE_CELL,
  USER_BOOKINGS_LIST_HEADER_CLASS,
  USER_BOOKINGS_LIST_ROW_CLASS,
  USER_BOOKINGS_LIST_STATUS_CELL,
  USER_BOOKINGS_LIST_TABLE_CLASS,
  USER_BOOKINGS_LIST_TIME_CELL,
} from "@/components/account/user-bookings-list-layout";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { useUserListBoardView } from "@/hooks/use-user-list-board-view";
import { useMemberWaitlistData } from "@/hooks/use-member-waitlist-data";
import { parseSessionSortOrder, sortBySessionStartsAt } from "@/lib/list-sort";
import {
  readUserListOrderFromSearch,
  syncUserListOrderQuery,
} from "@/lib/user-list-order-url";
import type { UserWaitlistRow } from "@/lib/user-booking-types";

type UserWaitlistsSectionProps = {
  locale: string;
  rows: readonly UserWaitlistRow[];
  loadError: boolean;
  embeddedInSheet?: boolean;
};

export function UserWaitlistsSection({
  locale,
  rows,
  loadError,
  embeddedInSheet = false,
}: UserWaitlistsSectionProps) {
  const t = useTranslations("userPages.waitlists");
  const {
    rows: liveRows,
    loaded: liveLoaded,
    error: liveError,
  } = useMemberWaitlistData(true);
  const effectiveRows = liveLoaded ? liveRows : rows;
  const effectiveLoadError = liveLoaded ? liveError : loadError;
  const tSort = useTranslations("listSort");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewMode, setView] = useUserListBoardView("waitlists");
  const [filters, setFilters] = useState<UserSessionFilterValues>(() => ({
    ...DEFAULT_USER_SESSION_FILTER_VALUES,
    order: readUserListOrderFromSearch(
      Object.fromEntries(searchParams.entries()),
      "session",
      "upcoming",
    ),
  }));

  const replaceSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutator(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const filterOptions = useMemo(
    () => extractSessionFilterOptions(effectiveRows.map((row) => row.session)),
    [effectiveRows],
  );

  const filterFields = useMemo(
    () =>
      buildUserSessionFilterFields({
        classTypes: filterOptions.classTypes,
        coaches: filterOptions.coaches,
        labels: {
          dateFrom: t("filters.dateFrom"),
          dateTo: t("filters.dateTo"),
          classAll: t("filters.classAll"),
          coachAll: t("filters.coachAll"),
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
    () => userSessionIntegratedFilterValues(filters, false),
    [filters],
  );

  const filteredRows = useMemo(
    () =>
      sortBySessionStartsAt(
        effectiveRows.filter((row) => matchesUserWaitlistFilters(row, filters)),
        (row) => row.session.startsAt,
        filters.order,
      ),
    [filters, effectiveRows],
  );

  const filtersActive = hasActiveUserSessionFilters(filters, false);

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
      case "order":
        setFilters((current) => ({
          ...current,
          order: parseSessionSortOrder(value),
        }));
        replaceSearchParams((params) => {
          syncUserListOrderQuery(params, value, "upcoming");
        });
        break;
      default:
        break;
    }
  }

  function resetFilters(): void {
    setFilters(DEFAULT_USER_SESSION_FILTER_VALUES);
    replaceSearchParams((params) => {
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
          pageId="waitlists"
          namespace="userPages.waitlists"
          value={viewMode}
          onChange={setView}
        />
      }
    />
  );

  const listBody = effectiveLoadError ? (
    <section className="rounded-[20px] border border-rose-100 bg-rose-50/70 p-5 text-sm text-rose-800">
      {t("loadError")}
    </section>
  ) : effectiveRows.length === 0 ? (
    <section className="rounded-[20px] border border-white/60 bg-white/75 p-5 sm:p-6">
      <h2 className="ommm-h3 text-sage-800">{t("emptyTitle")}</h2>
      <p className="ommm-body-muted mt-2 text-sm">{t("emptyDescription")}</p>
    </section>
  ) : (
    <>
      <p className="text-sm text-sage-600">
        {t("waitlistsCount", { count: filtersActive ? filteredRows.length : effectiveRows.length })}
      </p>

      {filteredRows.length === 0 ? (
        <div className="rounded-2xl border border-sage-100 bg-white/80 p-5 text-sm">
          <p className="font-medium text-sage-900">{t("filteredEmptyTitle")}</p>
          <p className="mt-1 text-sage-600">{t("filteredEmptyDescription")}</p>
        </div>
      ) : (
        <UserViewContentEnter viewKey={viewMode}>
          {viewMode === "board" ? (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredRows.map((item) => (
                <li key={item.id} className="min-w-0 list-none">
                  <UserWaitlistBoardCard locale={locale} waitlist={item} />
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
              {filteredRows.map((item) => (
                <div key={item.id} className={USER_BOOKINGS_LIST_ROW_CLASS}>
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
                  <div className={USER_BOOKINGS_LIST_ACTIONS_CELL} aria-hidden="true" />
                </div>
              ))}
            </div>
          )}
        </UserViewContentEnter>
      )}
    </>
  );

  return (
    <div className="space-y-4">
      {embeddedInSheet ? (
        heroSearch
      ) : (
        <AdminPageHero title={t("title")} description={t("description")} search={heroSearch} />
      )}
      {listBody}
    </div>
  );
}
