export type ScheduleQuickFilter =
  | "today"
  | "thisWeek"
  | "available"
  | "full"
  | "cancelled"
  | "beginner"
  | "evening";

export const SCHEDULE_QUICK_FILTER_VALUES: readonly ScheduleQuickFilter[] = [
  "today",
  "thisWeek",
  "available",
  "full",
  "cancelled",
  "beginner",
  "evening",
];

type ScheduleQuickFilterRow = {
  startsAt: string;
  level: string | null;
  status: string;
  capacity: number;
  _count: { bookings: number };
};

import {
  localIsoDateFromValue,
  scheduleSessionLocalIsoDay,
  scheduleTodayIsoDate,
} from "@/lib/local-iso-date";
import { addDays } from "@/components/marketing/schedule/schedule-date-utils";

function spotsLeft(row: ScheduleQuickFilterRow): number {
  return Math.max(row.capacity - row._count.bookings, 0);
}

function splitSessionLevels(level: string | null): string[] {
  if (!level) {
    return [];
  }
  return level
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

/** Applies quick-filter presets on top of main schedule filters (AND). */
export function matchesScheduleQuickFilters(
  row: ScheduleQuickFilterRow,
  quickFilters: readonly ScheduleQuickFilter[],
): boolean {
  if (quickFilters.length === 0) {
    return true;
  }

  const today = scheduleTodayIsoDate();
  const weekEnd = localIsoDateFromValue(addDays(new Date(), 7));
  const rowDate = scheduleSessionLocalIsoDay(row.startsAt);

  const dateQuick = quickFilters.filter(
    (filter): filter is "today" | "thisWeek" => filter === "today" || filter === "thisWeek",
  );
  if (dateQuick.length > 0) {
    const matchesDate = dateQuick.some((filter) =>
      filter === "today" ? rowDate === today : rowDate >= today && rowDate <= weekEnd,
    );
    if (!matchesDate) {
      return false;
    }
  }

  const availabilityQuick = quickFilters.filter(
    (filter): filter is "available" | "full" => filter === "available" || filter === "full",
  );
  if (availabilityQuick.length > 0) {
    const available = spotsLeft(row) > 0;
    const full = spotsLeft(row) === 0;
    const matchesAvailability = availabilityQuick.some((filter) =>
      filter === "available" ? available : full,
    );
    if (!matchesAvailability) {
      return false;
    }
  }

  if (quickFilters.includes("cancelled") && row.status !== "CANCELLED") {
    return false;
  }
  if (quickFilters.includes("beginner") && !splitSessionLevels(row.level).includes("Beginner")) {
    return false;
  }
  if (quickFilters.includes("evening") && new Date(row.startsAt).getHours() < 17) {
    return false;
  }

  return true;
}
