import type { IntegratedFilterField } from "@/components/shared/search/integrated-search-filter-types";
import type { CoachPanelBookingRow } from "@/lib/coach-panel-types";
import { formatFilterDateChipLabel } from "@/lib/filter-date-display";

export type CoachRosterFilterValues = {
  search: string;
  from: string;
  to: string;
  classType: string;
};

export const DEFAULT_COACH_ROSTER_FILTER_VALUES: CoachRosterFilterValues = {
  search: "",
  from: "",
  to: "",
  classType: "all",
};

type BuildCoachRosterFilterFieldsArgs = {
  classTypes: readonly string[];
  labels: {
    dateFrom: string;
    dateTo: string;
    classAll: string;
    searchPlaceholder: string;
    resetFilters: string;
  };
};

export function coachRosterIntegratedFilterValues(
  values: Omit<CoachRosterFilterValues, "search">,
): Record<string, string> {
  return {
    from: values.from,
    to: values.to,
    classType: values.classType,
  };
}

export function buildCoachRosterFilterFields({
  classTypes,
  labels,
}: BuildCoachRosterFilterFieldsArgs): IntegratedFilterField[] {
  return [
    {
      key: "from",
      label: labels.dateFrom,
      fieldType: "date",
      emptyValue: "",
      resolveChipLabel: (value) => formatFilterDateChipLabel(labels.dateFrom, value),
    },
    {
      key: "to",
      label: labels.dateTo,
      fieldType: "date",
      emptyValue: "",
      resolveChipLabel: (value) => formatFilterDateChipLabel(labels.dateTo, value),
    },
    {
      key: "classType",
      label: "Class type",
      emptyValue: "all",
      allLabel: labels.classAll,
      options: classTypes.map((name) => ({ value: name, label: name })),
    },
  ];
}

export function extractCoachRosterClassTypes(
  roster: readonly CoachPanelBookingRow[],
): string[] {
  const names = new Set<string>();
  for (const row of roster) {
    names.add(row.session.classType.name);
  }
  return Array.from(names).sort((left, right) => left.localeCompare(right));
}

export function matchesCoachRosterFilters(
  row: CoachPanelBookingRow,
  filters: CoachRosterFilterValues,
): boolean {
  const startsAt = new Date(row.session.startsAt);

  if (filters.from && startsAt < new Date(`${filters.from}T00:00:00`)) {
    return false;
  }
  if (filters.to && startsAt > new Date(`${filters.to}T23:59:59`)) {
    return false;
  }
  if (filters.classType !== "all" && row.session.classType.name !== filters.classType) {
    return false;
  }

  const search = filters.search.trim().toLowerCase();
  if (search.length === 0) {
    return true;
  }

  const userLabel = row.user.name ?? row.user.email;
  const haystack = `${userLabel} ${row.user.email} ${row.session.classType.name}`.toLowerCase();
  return haystack.includes(search);
}

export function hasActiveCoachRosterFilters(filters: CoachRosterFilterValues): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.from.length > 0 ||
    filters.to.length > 0 ||
    filters.classType !== "all"
  );
}
