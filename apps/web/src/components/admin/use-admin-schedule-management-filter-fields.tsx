"use client";

import { useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  adminScheduleIntegratedFilterValues,
  buildAdminScheduleFilterFields,
  parseAdminScheduleListFilter,
  serializeAdminScheduleListFilter,
} from "@/components/admin/admin-schedule-filter-fields";
import { STATUS_OPTIONS } from "@/components/admin/admin-schedule-management.constants";
import type { SchedulePackageOption } from "@/components/admin/admin-schedule-package-filter-options";
import { SCHEDULE_QUICK_FILTER_VALUES, type ScheduleQuickFilter } from "@/components/admin/admin-schedule-quick-filters";
import { coachName } from "@/components/admin/admin-schedule-session.helpers";
import type {
  AdminScheduleCoach,
  AdminScheduleFilters,
  AvailabilityOption,
  SessionStatus,
  TimeOfDayOption,
} from "@/components/admin/admin-schedule-session.types";
import { OmmFilterMultiSelect } from "@/components/ui/omm-filter-multi-select";
import { parseSessionSortOrder } from "@/lib/list-sort";

type UseAdminScheduleListFilterFieldsParams = {
  coaches: readonly AdminScheduleCoach[];
  levels: readonly string[];
  packageOptions: readonly SchedulePackageOption[];
  filters: AdminScheduleFilters;
  quickFilters: ScheduleQuickFilter[];
  patchFilterState: (
    patch: {
      filters?: Partial<AdminScheduleFilters>;
      quickFilters?: ScheduleQuickFilter[];
    },
    resetPage?: boolean,
  ) => void;
};

export function useAdminScheduleListFilterFields({
  coaches,
  levels,
  packageOptions,
  filters,
  quickFilters,
  patchFilterState,
}: UseAdminScheduleListFilterFieldsParams) {
  const t = useTranslations("adminPages.classes");
  const tSort = useTranslations("listSort");

  const quickOptions = useMemo(
    () =>
      SCHEDULE_QUICK_FILTER_VALUES.map((value) => ({
        value,
        label: t(`quick.${value}`),
      })),
    [t],
  );

  const scheduleMultiSelectFormat = useCallback(
    (count: number) => t("filters.selectedCount", { count }),
    [t],
  );

  const filterFields = useMemo(
    () =>
      buildAdminScheduleFilterFields({
        labels: {
          fromDate: t("filters.fromDateLabel"),
          toDate: t("filters.toDateLabel"),
          coach: t("filters.coachLabel"),
          type: t("filters.typeLabel"),
          level: t("filters.levelLabel"),
          status: t("filters.statusLabel"),
          availability: t("filters.availabilityLabel"),
          timeOfDay: t("filters.timeOfDayLabel"),
          quick: t("filters.quickFilterLabel"),
          sort: tSort("sort"),
          sortUpcoming: tSort("upcoming"),
          sortDateAsc: tSort("dateAsc"),
          sortDateDesc: tSort("dateDesc"),
        },
        renderCoachIds: ({ value, onChange }) => (
          <OmmFilterMultiSelect
            wrapLabel
            formatSelectedCount={scheduleMultiSelectFormat}
            ariaLabel={t("filters.coachLabel")}
            allLabel={t("filters.allCoaches")}
            selectedValues={parseAdminScheduleListFilter(value)}
            onChange={(values) => onChange(serializeAdminScheduleListFilter(values))}
            options={coaches.map((coach) => ({ value: coach.id, label: coachName(coach) }))}
          />
        ),
        renderTypeIds: ({ value, onChange }) => (
          <OmmFilterMultiSelect
            wrapLabel
            formatSelectedCount={scheduleMultiSelectFormat}
            ariaLabel={t("filters.typeLabel")}
            allLabel={t("filters.allTypes")}
            selectedValues={parseAdminScheduleListFilter(value)}
            onChange={(next) => onChange(serializeAdminScheduleListFilter(next))}
            options={packageOptions.map((option) => ({
              value: option.id,
              label: option.label,
            }))}
          />
        ),
        renderLevels: ({ value, onChange }) => (
          <OmmFilterMultiSelect
            wrapLabel
            formatSelectedCount={scheduleMultiSelectFormat}
            ariaLabel={t("filters.levelLabel")}
            allLabel={t("filters.allLevels")}
            selectedValues={parseAdminScheduleListFilter(value)}
            onChange={(next) => onChange(serializeAdminScheduleListFilter(next))}
            options={levels.map((level) => ({ value: level, label: level }))}
          />
        ),
        renderStatuses: ({ value, onChange }) => (
          <OmmFilterMultiSelect
            wrapLabel
            formatSelectedCount={scheduleMultiSelectFormat}
            ariaLabel={t("filters.statusLabel")}
            allLabel={t("filters.allStatuses")}
            selectedValues={parseAdminScheduleListFilter(value)}
            onChange={(next) => onChange(serializeAdminScheduleListFilter(next))}
            options={STATUS_OPTIONS.map((status) => ({
              value: status,
              label: t(`status.${status}`),
            }))}
          />
        ),
        renderAvailability: ({ value, onChange }) => (
          <OmmFilterMultiSelect
            wrapLabel
            formatSelectedCount={scheduleMultiSelectFormat}
            ariaLabel={t("filters.availabilityLabel")}
            allLabel={t("filters.allAvailability")}
            selectedValues={parseAdminScheduleListFilter(value)}
            onChange={(next) => onChange(serializeAdminScheduleListFilter(next))}
            options={[
              { value: "available", label: t("filters.availableOnly") },
              { value: "full", label: t("filters.fullOnly") },
            ]}
          />
        ),
        renderTimeOfDay: ({ value, onChange }) => (
          <OmmFilterMultiSelect
            wrapLabel
            formatSelectedCount={scheduleMultiSelectFormat}
            ariaLabel={t("filters.timeOfDayLabel")}
            allLabel={t("filters.allTimes")}
            selectedValues={parseAdminScheduleListFilter(value)}
            onChange={(next) => onChange(serializeAdminScheduleListFilter(next))}
            options={[
              { value: "morning", label: t("filters.morning") },
              { value: "afternoon", label: t("filters.afternoon") },
              { value: "evening", label: t("filters.evening") },
            ]}
          />
        ),
        renderQuick: ({ value, onChange }) => (
          <OmmFilterMultiSelect
            variant="accent"
            wrapLabel
            formatSelectedCount={scheduleMultiSelectFormat}
            ariaLabel={t("filters.quickFilterLabel")}
            allLabel={t("filters.allQuickFilters")}
            selectedValues={parseAdminScheduleListFilter(value)}
            onChange={(next) => onChange(serializeAdminScheduleListFilter(next))}
            options={quickOptions}
          />
        ),
      }),
    [coaches, levels, packageOptions, quickOptions, scheduleMultiSelectFormat, t, tSort],
  );

  const integratedFilterValues = useMemo(
    () =>
      adminScheduleIntegratedFilterValues(
        {
          from: filters.from,
          to: filters.to,
          coachIds: filters.coachIds,
          typeIds: filters.typeIds,
          levels: filters.levels,
          statuses: filters.statuses,
          availability: filters.availability,
          timeOfDay: filters.timeOfDay,
          order: filters.order,
        },
        quickFilters,
      ),
    [filters, quickFilters],
  );

  const handleIntegratedFilterChange = useCallback(
    (key: string, value: string) => {
      switch (key) {
        case "from":
          patchFilterState({ filters: { from: value } });
          break;
        case "to":
          patchFilterState({ filters: { to: value } });
          break;
        case "order":
          patchFilterState({
            filters: { order: parseSessionSortOrder(value) },
          });
          break;
        case "coachIds":
          patchFilterState({ filters: { coachIds: parseAdminScheduleListFilter(value) } });
          break;
        case "typeIds":
          patchFilterState({ filters: { typeIds: parseAdminScheduleListFilter(value) } });
          break;
        case "levels":
          patchFilterState({ filters: { levels: parseAdminScheduleListFilter(value) } });
          break;
        case "statuses":
          patchFilterState({
            filters: { statuses: parseAdminScheduleListFilter(value) as SessionStatus[] },
          });
          break;
        case "availability":
          patchFilterState({
            filters: {
              availability: parseAdminScheduleListFilter(value) as AvailabilityOption[],
            },
          });
          break;
        case "timeOfDay":
          patchFilterState({
            filters: { timeOfDay: parseAdminScheduleListFilter(value) as TimeOfDayOption[] },
          });
          break;
        case "quick":
          patchFilterState({
            quickFilters: parseAdminScheduleListFilter(value) as ScheduleQuickFilter[],
          });
          break;
        default:
          break;
      }
    },
    [patchFilterState],
  );

  return {
    filterFields,
    integratedFilterValues,
    handleIntegratedFilterChange,
  };
}
