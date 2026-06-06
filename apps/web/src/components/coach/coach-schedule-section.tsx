"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  buildCoachScheduleFilterFields,
  coachScheduleIntegratedFilterValues,
  DEFAULT_COACH_SCHEDULE_FILTER_VALUES,
  extractCoachScheduleClassTypes,
  hasActiveCoachScheduleFilters,
  matchesCoachScheduleFilters,
  type CoachScheduleFilterValues,
  type CoachScheduleStatusFilter,
} from "@/components/coach/coach-schedule-filter-fields";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { StaffScheduleListWeekViews } from "@/components/shared/schedule/staff-schedule-list-week-views";
import { ScheduleViewSwitcher } from "@/components/shared/schedule/schedule-view-switcher";
import { useScheduleViewUrl } from "@/hooks/use-schedule-view-url";
import type { ScheduleView } from "@/components/admin/admin-schedule-view";
import type { CoachPanelSessionRow } from "@/lib/coach-panel-types";

type CoachScheduleSectionProps = {
  locale: string;
  sessions: readonly CoachPanelSessionRow[];
  initialView: ScheduleView;
};

export function CoachScheduleSection({
  locale,
  sessions,
  initialView,
}: CoachScheduleSectionProps) {
  const t = useTranslations("coachPages.schedule");
  const tStatus = useTranslations("adminPages.classes.status");
  const [view, setView] = useScheduleViewUrl(initialView);
  const [filters, setFilters] = useState<CoachScheduleFilterValues>(
    DEFAULT_COACH_SCHEDULE_FILTER_VALUES,
  );

  const classTypes = useMemo(() => extractCoachScheduleClassTypes(sessions), [sessions]);

  const filterFields = useMemo(
    () =>
      buildCoachScheduleFilterFields({
        classTypes,
        labels: {
          dateFrom: t("filters.dateFrom"),
          dateTo: t("filters.dateTo"),
          classAll: t("filters.classAll"),
          status: t("filters.status"),
          statusAll: t("filters.statusAll"),
          statusValues: {
            ACTIVE: tStatus("ACTIVE"),
            FULL: tStatus("FULL"),
            CANCELLED: tStatus("CANCELLED"),
            DRAFT: tStatus("DRAFT"),
          },
          searchPlaceholder: t("filters.searchPlaceholder"),
          resetFilters: t("filters.resetFilters"),
        },
      }),
    [classTypes, t, tStatus],
  );

  const integratedFilterValues = useMemo(
    () => coachScheduleIntegratedFilterValues(filters),
    [filters],
  );

  const filteredSessions = useMemo(
    () => sessions.filter((session) => matchesCoachScheduleFilters(session, filters)),
    [filters, sessions],
  );

  const filtersActive = hasActiveCoachScheduleFilters(filters);

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
      case "status":
        setFilters((current) => ({
          ...current,
          status: value as CoachScheduleStatusFilter,
        }));
        break;
      default:
        break;
    }
  }

  function resetFilters(): void {
    setFilters(DEFAULT_COACH_SCHEDULE_FILTER_VALUES);
  }

  const emptyTitle = filtersActive
    ? t("filteredEmptyTitle")
    : t("upcomingSessions.empty");
  const emptyBody = filtersActive ? t("filteredEmptyDescription") : "";

  return (
    <StaffListPageLayout
      title={t("title")}
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
      searchTrailing={<ScheduleViewSwitcher value={view} onChange={setView} />}
    >
      {sessions.length > 0 ? (
        <p className="text-sm text-sage-600">
          {t("sessionsCount", {
            count: filtersActive ? filteredSessions.length : sessions.length,
          })}
        </p>
      ) : null}

      <StaffScheduleListWeekViews
        locale={locale}
        view={view}
        rows={filteredSessions}
        preset="staffReadOnly"
        emptyTitle={emptyTitle}
        emptyBody={emptyBody}
      />
    </StaffListPageLayout>
  );
}
