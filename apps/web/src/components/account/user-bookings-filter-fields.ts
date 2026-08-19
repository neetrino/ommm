import { resolveSessionCoachName } from "@/components/account/session-coach-line";
import type { IntegratedFilterField } from "@/components/shared/search/integrated-search-filter-types";
import { formatFilterDateChipLabel } from "@/lib/filter-date-display";
import { matchesStudioDateFilter } from "@/lib/filter-date-range";
import { matchesSearchTokens } from "@/lib/search-tokens";
import { buildSessionSortFilterField, type SessionSortOrder } from "@/lib/list-sort";
import type { UserBookingRow } from "@/lib/user-booking-types";

export type UserBookingStatusFilter = "all" | "BOOKED" | "COMPLETED" | "CANCELLED" | "MISSED";

export type UserBookingFilterValues = {
  search: string;
  from: string;
  to: string;
  classType: string;
  coach: string;
  status: UserBookingStatusFilter;
  order: SessionSortOrder;
};

export const DEFAULT_USER_BOOKING_FILTER_VALUES: UserBookingFilterValues = {
  search: "",
  from: "",
  to: "",
  classType: "all",
  coach: "all",
  status: "all",
  order: "upcoming",
};

const BOOKING_STATUS_OPTIONS: readonly Exclude<UserBookingStatusFilter, "all">[] = [
  "BOOKED",
  "COMPLETED",
  "CANCELLED",
  "MISSED",
];

type BuildUserBookingsFilterFieldsArgs = {
  classTypes: readonly string[];
  coaches: readonly string[];
  labels: {
    dateFrom: string;
    dateTo: string;
    classAll: string;
    coachAll: string;
    status: string;
    statusAll: string;
    statusValues: Record<Exclude<UserBookingStatusFilter, "all">, string>;
    searchPlaceholder: string;
    resetFilters: string;
    sort: string;
    sortUpcoming: string;
    sortDateAsc: string;
    sortDateDesc: string;
  };
};

export function userBookingsIntegratedFilterValues(
  values: Omit<UserBookingFilterValues, "search">,
): Record<string, string> {
  return {
    from: values.from,
    to: values.to,
    classType: values.classType,
    coach: values.coach,
    status: values.status,
    order: values.order,
  };
}

export function buildUserBookingsFilterFields({
  classTypes,
  coaches,
  labels,
}: BuildUserBookingsFilterFieldsArgs): IntegratedFilterField[] {
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
    {
      key: "coach",
      label: "Coach",
      emptyValue: "all",
      allLabel: labels.coachAll,
      options: coaches.map((name) => ({ value: name, label: name })),
    },
    {
      key: "status",
      label: labels.status,
      emptyValue: "all",
      allLabel: labels.statusAll,
      options: BOOKING_STATUS_OPTIONS.map((status) => ({
        value: status,
        label: labels.statusValues[status],
      })),
    },
    buildSessionSortFilterField(labels.sort, {
      upcoming: labels.sortUpcoming,
      "date-asc": labels.sortDateAsc,
      "date-desc": labels.sortDateDesc,
    }),
  ];
}

export function extractUserBookingFilterOptions(rows: readonly UserBookingRow[]): {
  classTypes: string[];
  coaches: string[];
} {
  const classTypeSet = new Set<string>();
  const coachSet = new Set<string>();

  for (const row of rows) {
    classTypeSet.add(row.session.classType.name);
    const coachName = resolveSessionCoachName(row.session.coach);
    if (coachName) {
      coachSet.add(coachName);
    }
  }

  return {
    classTypes: Array.from(classTypeSet).sort((left, right) => left.localeCompare(right)),
    coaches: Array.from(coachSet).sort((left, right) => left.localeCompare(right)),
  };
}

export function matchesUserBookingFilters(
  row: UserBookingRow,
  filters: UserBookingFilterValues,
): boolean {
  if (!matchesStudioDateFilter(row.session.startsAt, filters.from, filters.to)) {
    return false;
  }
  if (filters.classType !== "all" && row.session.classType.name !== filters.classType) {
    return false;
  }
  if (filters.coach !== "all") {
    const coachName = resolveSessionCoachName(row.session.coach);
    if (coachName !== filters.coach) {
      return false;
    }
  }
  if (filters.status !== "all" && row.status !== filters.status) {
    return false;
  }

  const coachName = resolveSessionCoachName(row.session.coach);
  const haystack = `${row.session.classType.name} ${coachName} ${row.status}`;
  if (!matchesSearchTokens(haystack, filters.search)) {
    return false;
  }

  return true;
}

export function hasActiveUserBookingFilters(filters: UserBookingFilterValues): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.from.length > 0 ||
    filters.to.length > 0 ||
    filters.classType !== "all" ||
    filters.coach !== "all" ||
    filters.status !== "all" ||
    filters.order !== "upcoming"
  );
}
