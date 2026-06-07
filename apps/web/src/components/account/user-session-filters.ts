import { resolveSessionCoachName } from "@/components/account/session-coach-line";
import type { IntegratedFilterField } from "@/components/shared/search/integrated-search-filter-types";
import { formatFilterDateChipLabel } from "@/lib/filter-date-display";
import type { UserSessionRow, UserWaitlistRow } from "@/lib/user-booking-types";

export type UserSessionAvailabilityFilter = "all" | "available" | "full";

export type UserSessionFilterValues = {
  search: string;
  from: string;
  to: string;
  classType: string;
  coach: string;
  availability: UserSessionAvailabilityFilter;
};

export const DEFAULT_USER_SESSION_FILTER_VALUES: UserSessionFilterValues = {
  search: "",
  from: "",
  to: "",
  classType: "all",
  coach: "all",
  availability: "all",
};

type SessionFilterSource = {
  startsAt: string;
  classType: { name: string };
  coach: { user: { name: string | null } };
};

type BuildUserSessionFilterFieldsArgs = {
  classTypes: readonly string[];
  coaches: readonly string[];
  includeAvailability?: boolean;
  labels: {
    dateFrom: string;
    dateTo: string;
    classAll: string;
    coachAll: string;
    availability?: string;
    availabilityAll?: string;
    availabilityAvailable?: string;
    availabilityFull?: string;
    searchPlaceholder: string;
    resetFilters: string;
  };
};

const AVAILABILITY_OPTIONS: readonly Exclude<UserSessionAvailabilityFilter, "all">[] = [
  "available",
  "full",
];

export function userSessionIntegratedFilterValues(
  values: Omit<UserSessionFilterValues, "search">,
  includeAvailability: boolean,
): Record<string, string> {
  const base = {
    from: values.from,
    to: values.to,
    classType: values.classType,
    coach: values.coach,
  };
  if (!includeAvailability) {
    return base;
  }
  return { ...base, availability: values.availability };
}

export function buildUserSessionFilterFields({
  classTypes,
  coaches,
  includeAvailability = false,
  labels,
}: BuildUserSessionFilterFieldsArgs): IntegratedFilterField[] {
  const fields: IntegratedFilterField[] = [
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
    {
      key: "coach",
      label: "Coach",
      emptyValue: "all",
      allLabel: labels.coachAll,
      options: coaches.map((name) => ({ value: name, label: name })),
    },
  ];

  if (includeAvailability && labels.availability) {
    fields.push({
      key: "availability",
      label: labels.availability,
      emptyValue: "all",
      allLabel: labels.availabilityAll ?? "All",
      options: AVAILABILITY_OPTIONS.map((value) => ({
        value,
        label:
          value === "available"
            ? (labels.availabilityAvailable ?? "Available")
            : (labels.availabilityFull ?? "Full"),
      })),
    });
  }

  return fields;
}

export function extractSessionFilterOptions(
  rows: readonly SessionFilterSource[],
): { classTypes: string[]; coaches: string[] } {
  const classTypeSet = new Set<string>();
  const coachSet = new Set<string>();

  for (const row of rows) {
    classTypeSet.add(row.classType.name);
    const coachName = resolveSessionCoachName(row.coach);
    if (coachName) {
      coachSet.add(coachName);
    }
  }

  return {
    classTypes: Array.from(classTypeSet).sort((left, right) => left.localeCompare(right)),
    coaches: Array.from(coachSet).sort((left, right) => left.localeCompare(right)),
  };
}

function matchesSessionBaseFilters(
  row: SessionFilterSource,
  filters: UserSessionFilterValues,
): boolean {
  const startsAt = new Date(row.startsAt);

  if (filters.from && startsAt < new Date(`${filters.from}T00:00:00`)) {
    return false;
  }
  if (filters.to && startsAt > new Date(`${filters.to}T23:59:59`)) {
    return false;
  }
  if (filters.classType !== "all" && row.classType.name !== filters.classType) {
    return false;
  }
  if (filters.coach !== "all") {
    const coachName = resolveSessionCoachName(row.coach);
    if (coachName !== filters.coach) {
      return false;
    }
  }

  const search = filters.search.trim().toLowerCase();
  if (search.length > 0) {
    const coachName = resolveSessionCoachName(row.coach);
    const haystack = `${row.classType.name} ${coachName ?? ""}`.toLowerCase();
    if (!haystack.includes(search)) {
      return false;
    }
  }

  return true;
}

export function matchesUserWaitlistFilters(
  row: UserWaitlistRow,
  filters: UserSessionFilterValues,
): boolean {
  return matchesSessionBaseFilters(row.session, filters);
}

export function matchesUserSessionFilters(
  row: UserSessionRow,
  filters: UserSessionFilterValues,
): boolean {
  if (!matchesSessionBaseFilters(row, filters)) {
    return false;
  }

  if (filters.availability === "all") {
    return true;
  }

  const booked = row._count.bookings;
  const isFull = row.status === "FULL" || booked >= row.capacity;
  if (filters.availability === "full") {
    return isFull;
  }
  return !isFull;
}

export function hasActiveUserSessionFilters(
  filters: UserSessionFilterValues,
  includeAvailability: boolean,
): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.from.length > 0 ||
    filters.to.length > 0 ||
    filters.classType !== "all" ||
    filters.coach !== "all" ||
    (includeAvailability && filters.availability !== "all")
  );
}
