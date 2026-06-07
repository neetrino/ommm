"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { MarkAttendanceButtons } from "@/components/coach/mark-attendance-buttons";
import {
  buildCoachRosterFilterFields,
  coachRosterIntegratedFilterValues,
  DEFAULT_COACH_ROSTER_FILTER_VALUES,
  extractCoachRosterClassTypes,
  hasActiveCoachRosterFilters,
  matchesCoachRosterFilters,
  type CoachRosterFilterValues,
} from "@/components/coach/coach-roster-filter-fields";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { StaffRosterTable } from "@/components/shared/staff/staff-roster-table";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import type { CoachPanelBookingRow } from "@/lib/coach-panel-types";

type CoachGroupsSectionProps = {
  locale: string;
  roster: readonly CoachPanelBookingRow[];
  banner?: string;
};

export function CoachGroupsSection({ locale, roster, banner }: CoachGroupsSectionProps) {
  const t = useTranslations("coachPages.groups");
  const [filters, setFilters] = useState<CoachRosterFilterValues>(DEFAULT_COACH_ROSTER_FILTER_VALUES);

  const classTypes = useMemo(() => extractCoachRosterClassTypes(roster), [roster]);

  const filterFields = useMemo(
    () =>
      buildCoachRosterFilterFields({
        classTypes,
        labels: {
          dateFrom: t("filters.dateFrom"),
          dateTo: t("filters.dateTo"),
          classAll: t("filters.classAll"),
          searchPlaceholder: t("filters.searchPlaceholder"),
          resetFilters: t("filters.resetFilters"),
        },
      }),
    [classTypes, t],
  );

  const integratedFilterValues = useMemo(
    () => coachRosterIntegratedFilterValues(filters),
    [filters],
  );

  const filteredRoster = useMemo(
    () => roster.filter((row) => matchesCoachRosterFilters(row, filters)),
    [filters, roster],
  );

  const filtersActive = hasActiveCoachRosterFilters(filters);

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
      default:
        break;
    }
  }

  function resetFilters(): void {
    setFilters(DEFAULT_COACH_ROSTER_FILTER_VALUES);
  }

  const tableItems = useMemo(
    () =>
      filteredRoster.map((row) => ({
        row: {
          id: row.id,
          user: row.user,
          session: row.session,
        },
        actions: <MarkAttendanceButtons bookingId={row.id} />,
      })),
    [filteredRoster],
  );

  const emptyTitle = filtersActive ? t("filteredEmptyTitle") : t("attendanceRoster.empty");
  const emptyBody = filtersActive ? t("filteredEmptyDescription") : "";

  return (
    <StaffListPageLayout
      title={t("title")}
      banner={banner}
      search={
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
      }
    >
      {roster.length > 0 ? (
        <p className="text-sm text-sage-600">
          {t("rosterCount", {
            count: filtersActive ? filteredRoster.length : roster.length,
          })}
        </p>
      ) : null}

      <StaffRosterTable
        locale={locale}
        items={tableItems}
        emptyTitle={emptyTitle}
        emptyBody={emptyBody}
      />
    </StaffListPageLayout>
  );
}
