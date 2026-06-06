import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import type { ScheduleQuickFilter } from "@/components/admin/admin-schedule-quick-filters";

type SessionStatus = "ACTIVE" | "CANCELLED" | "FULL" | "DRAFT";
type AvailabilityOption = "available" | "full";
type TimeOfDayOption = "morning" | "afternoon" | "evening";

const LIST_SEPARATOR = ",";

export type ScheduleFiltersState = {
  from: string;
  to: string;
  coachIds: string[];
  typeIds: string[];
  levels: string[];
  statuses: SessionStatus[];
  availability: AvailabilityOption[];
  timeOfDay: TimeOfDayOption[];
};

export function serializeAdminScheduleListFilter(values: readonly string[]): string {
  return values.join(LIST_SEPARATOR);
}

export function parseAdminScheduleListFilter(value: string): string[] {
  if (value.trim() === "") {
    return [];
  }
  return value.split(LIST_SEPARATOR).map((item) => item.trim()).filter(Boolean);
}

export function adminScheduleIntegratedFilterValues(
  filters: ScheduleFiltersState,
  quickFilters: readonly ScheduleQuickFilter[],
): Record<string, string> {
  return {
    from: filters.from,
    to: filters.to,
    coachIds: serializeAdminScheduleListFilter(filters.coachIds),
    typeIds: serializeAdminScheduleListFilter(filters.typeIds),
    levels: serializeAdminScheduleListFilter(filters.levels),
    statuses: serializeAdminScheduleListFilter(filters.statuses),
    availability: serializeAdminScheduleListFilter(filters.availability),
    timeOfDay: serializeAdminScheduleListFilter(filters.timeOfDay),
    quick: serializeAdminScheduleListFilter(quickFilters),
  };
}

function multiSelectChipLabel(label: string, value: string): string | null {
  const count = parseAdminScheduleListFilter(value).length;
  if (count === 0) {
    return null;
  }
  return count === 1 ? `${label}: 1 selected` : `${label}: ${count} selected`;
}

type BuildAdminScheduleFilterFieldsArgs = {
  labels: {
    fromDate: string;
    toDate: string;
    coach: string;
    type: string;
    level: string;
    status: string;
    availability: string;
    timeOfDay: string;
    quick: string;
  };
  renderCoachIds: AdminIntegratedFilterField["render"];
  renderTypeIds: AdminIntegratedFilterField["render"];
  renderLevels: AdminIntegratedFilterField["render"];
  renderStatuses: AdminIntegratedFilterField["render"];
  renderAvailability: AdminIntegratedFilterField["render"];
  renderTimeOfDay: AdminIntegratedFilterField["render"];
  renderQuick: AdminIntegratedFilterField["render"];
};

export function buildAdminScheduleFilterFields({
  labels,
  renderCoachIds,
  renderTypeIds,
  renderLevels,
  renderStatuses,
  renderAvailability,
  renderTimeOfDay,
  renderQuick,
}: BuildAdminScheduleFilterFieldsArgs): AdminIntegratedFilterField[] {
  return [
    {
      key: "from",
      label: labels.fromDate,
      fieldType: "date",
      emptyValue: "",
      resolveChipLabel: (value) => (value ? `${labels.fromDate}: ${value}` : null),
    },
    {
      key: "to",
      label: labels.toDate,
      fieldType: "date",
      emptyValue: "",
      resolveChipLabel: (value) => (value ? `${labels.toDate}: ${value}` : null),
    },
    {
      key: "coachIds",
      label: labels.coach,
      emptyValue: "",
      resolveChipLabel: (value) => multiSelectChipLabel(labels.coach, value),
      render: renderCoachIds,
    },
    {
      key: "typeIds",
      label: labels.type,
      emptyValue: "",
      resolveChipLabel: (value) => multiSelectChipLabel(labels.type, value),
      render: renderTypeIds,
    },
    {
      key: "levels",
      label: labels.level,
      emptyValue: "",
      resolveChipLabel: (value) => multiSelectChipLabel(labels.level, value),
      render: renderLevels,
    },
    {
      key: "statuses",
      label: labels.status,
      emptyValue: "",
      resolveChipLabel: (value) => multiSelectChipLabel(labels.status, value),
      render: renderStatuses,
    },
    {
      key: "availability",
      label: labels.availability,
      emptyValue: "",
      resolveChipLabel: (value) => multiSelectChipLabel(labels.availability, value),
      render: renderAvailability,
    },
    {
      key: "timeOfDay",
      label: labels.timeOfDay,
      emptyValue: "",
      resolveChipLabel: (value) => multiSelectChipLabel(labels.timeOfDay, value),
      render: renderTimeOfDay,
    },
    {
      key: "quick",
      label: labels.quick,
      emptyValue: "",
      resolveChipLabel: (value) => multiSelectChipLabel(labels.quick, value),
      render: renderQuick,
    },
  ];
}
