import type {
  CoachPanelBookingRow,
  CoachPanelSessionRow,
  CoachRosterFilterValues,
  CoachScheduleFilterValues,
  SessionSortOrder,
} from "../types/coachPanel";

export const DEFAULT_COACH_SCHEDULE_FILTERS: CoachScheduleFilterValues = {
  search: "",
  from: "",
  to: "",
  classType: "all",
  status: "all",
  order: "upcoming",
};

export const DEFAULT_COACH_ROSTER_FILTERS: CoachRosterFilterValues = {
  search: "",
  from: "",
  to: "",
  classType: "all",
  order: "upcoming",
};

function localIsoDay(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayIsoDate(): string {
  return localIsoDay(new Date().toISOString());
}

export function compareSessionStartsAt(
  left: string,
  right: string,
  order: SessionSortOrder,
): number {
  if (order === "date-desc") {
    return right.localeCompare(left);
  }
  if (order === "date-asc") {
    return left.localeCompare(right);
  }
  const todayKey = todayIsoDate();
  const leftDay = localIsoDay(left);
  const rightDay = localIsoDay(right);
  const leftIsPast = leftDay < todayKey;
  const rightIsPast = rightDay < todayKey;
  if (leftIsPast !== rightIsPast) {
    return leftIsPast ? 1 : -1;
  }
  return left.localeCompare(right);
}

export function sortBySessionStartsAt<T>(
  rows: readonly T[],
  getStartsAt: (row: T) => string,
  order: SessionSortOrder,
): T[] {
  return [...rows].sort((left, right) =>
    compareSessionStartsAt(getStartsAt(left), getStartsAt(right), order),
  );
}

export function matchesCoachScheduleFilters(
  row: CoachPanelSessionRow,
  filters: CoachScheduleFilterValues,
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
  if (filters.status !== "all" && row.status !== filters.status) {
    return false;
  }
  const search = filters.search.trim().toLowerCase();
  if (search.length === 0) {
    return true;
  }
  const haystack = `${row.title} ${row.classType.name}`.toLowerCase();
  return haystack.includes(search);
}

export function hasActiveCoachScheduleFilters(
  filters: CoachScheduleFilterValues,
): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.from.length > 0 ||
    filters.to.length > 0 ||
    filters.classType !== "all" ||
    filters.status !== "all" ||
    filters.order !== "upcoming"
  );
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
  if (
    filters.classType !== "all" &&
    row.session.classType.name !== filters.classType
  ) {
    return false;
  }
  const search = filters.search.trim().toLowerCase();
  if (search.length === 0) {
    return true;
  }
  const haystack =
    `${row.user.name ?? row.user.email} ${row.user.email} ${row.session.classType.name}`.toLowerCase();
  return haystack.includes(search);
}

export function hasActiveCoachRosterFilters(
  filters: CoachRosterFilterValues,
): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.from.length > 0 ||
    filters.to.length > 0 ||
    filters.classType !== "all" ||
    filters.order !== "upcoming"
  );
}

export function extractClassTypeNames(
  names: readonly string[],
): string[] {
  return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
}

export function isSameLocalCalendarDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export function formatCoachSessionDate(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toLocaleDateString(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export function formatCoachSessionTime(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatPeakHourLabel(hour: number, locale: string): string {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
