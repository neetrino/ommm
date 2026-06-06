"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { USER_SCHEDULE_LIST_ACTIONS_HEADER_CELL, USER_SCHEDULE_LIST_HEADER_CLASS } from "@/components/account/user-schedule-list-layout";
import { USER_LIST_STACK_CLASS } from "@/components/account/user-list-table-layout";
import {
  buildUserSessionFilterFields,
  DEFAULT_USER_SESSION_FILTER_VALUES,
  extractSessionFilterOptions,
  hasActiveUserSessionFilters,
  matchesUserSessionFilters,
  userSessionIntegratedFilterValues,
  type UserSessionAvailabilityFilter,
  type UserSessionFilterValues,
} from "@/components/account/user-session-filters";
import { UserSessionCompactRow } from "@/components/account/user-session-compact-row";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { ScheduleViewSwitcher } from "@/components/shared/schedule/schedule-view-switcher";
import { ScheduleWeekColumnsView } from "@/components/shared/schedule/schedule-week-columns-view";
import { useScheduleViewUrl } from "@/hooks/use-schedule-view-url";
import { mapUserSessionToWeekRow } from "@/lib/map-user-session-to-week-row";
import type { ScheduleView } from "@/components/admin/admin-schedule-view";
import type { UserSessionRow } from "@/lib/user-booking-types";
import type { UserSessionBookingMap } from "@/lib/user-session-bookings-map";

type UserClassesSectionProps = {
  locale: string;
  sessions: readonly UserSessionRow[];
  sessionBookings: UserSessionBookingMap;
  initialView: ScheduleView;
};

export function UserClassesSection({
  locale,
  sessions,
  sessionBookings,
  initialView,
}: UserClassesSectionProps) {
  const t = useTranslations("userPages.classes");
  const tSchedule = useTranslations("adminPages.schedule");
  const [view, setView] = useScheduleViewUrl(initialView);
  const [filters, setFilters] = useState<UserSessionFilterValues>(DEFAULT_USER_SESSION_FILTER_VALUES);

  const filterOptions = useMemo(() => extractSessionFilterOptions(sessions), [sessions]);

  const filterFields = useMemo(
    () =>
      buildUserSessionFilterFields({
        classTypes: filterOptions.classTypes,
        coaches: filterOptions.coaches,
        includeAvailability: true,
        labels: {
          dateFrom: t("filters.dateFrom"),
          dateTo: t("filters.dateTo"),
          classAll: t("filters.classAll"),
          coachAll: t("filters.coachAll"),
          availability: t("filters.availability"),
          availabilityAll: t("filters.availabilityAll"),
          availabilityAvailable: t("filters.availabilityAvailable"),
          availabilityFull: t("filters.availabilityFull"),
          searchPlaceholder: t("filters.searchPlaceholder"),
          resetFilters: t("filters.resetFilters"),
        },
      }),
    [filterOptions.classTypes, filterOptions.coaches, t],
  );

  const integratedFilterValues = useMemo(
    () => userSessionIntegratedFilterValues(filters, true),
    [filters],
  );

  const filteredSessions = useMemo(
    () => sessions.filter((session) => matchesUserSessionFilters(session, filters)),
    [filters, sessions],
  );

  const weekRows = useMemo(
    () => filteredSessions.map(mapUserSessionToWeekRow),
    [filteredSessions],
  );

  const filtersActive = hasActiveUserSessionFilters(filters, true);

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
      case "availability":
        setFilters((current) => ({
          ...current,
          availability: value as UserSessionAvailabilityFilter,
        }));
        break;
      default:
        break;
    }
  }

  function resetFilters(): void {
    setFilters(DEFAULT_USER_SESSION_FILTER_VALUES);
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
      <ScheduleViewSwitcher value={view} onChange={setView} />
    </div>
  );

  return (
    <div className="space-y-4">
      <AdminPageHero title={t("title")} search={heroSearch} />

      {sessions.length === 0 ? (
        <p className="ommm-body-muted text-sm">{t("noSessions")}</p>
      ) : (
        <>
          <p className="text-sm text-sage-600">
            {t("sessionsCount", { count: filtersActive ? filteredSessions.length : sessions.length })}
          </p>

          {filteredSessions.length === 0 ? (
            <div className="rounded-2xl border border-sage-100 bg-white/80 p-5 text-sm">
              <p className="font-medium text-sage-900">{t("filteredEmptyTitle")}</p>
              <p className="mt-1 text-sage-600">{t("filteredEmptyDescription")}</p>
            </div>
          ) : view === "weekly" ? (
            <ScheduleWeekColumnsView
              locale={locale}
              rows={weekRows}
              showCoach
              labels={{
                gridAria: tSchedule("weekView.gridAria"),
                todayBadge: tSchedule("weekView.todayBadge"),
                emptyDay: tSchedule("weekView.emptyDay"),
              }}
            />
          ) : (
            <div className={USER_LIST_STACK_CLASS}>
              <div className={USER_SCHEDULE_LIST_HEADER_CLASS}>
                <span>{t("listHeaderDate")}</span>
                <span>{t("listHeaderClass")}</span>
                <span>{t("listHeaderTime")}</span>
                <span>{t("listHeaderCoach")}</span>
                <span>{t("listHeaderSpots")}</span>
                <span aria-hidden="true" />
                <span className={USER_SCHEDULE_LIST_ACTIONS_HEADER_CELL}>{t("listHeaderActions")}</span>
              </div>
              <ul className={USER_LIST_STACK_CLASS}>
                {filteredSessions.map((session) => (
                  <li key={session.id} className="list-none">
                    <UserSessionCompactRow
                      locale={locale}
                      session={session}
                      userBookingId={sessionBookings[session.id]}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
