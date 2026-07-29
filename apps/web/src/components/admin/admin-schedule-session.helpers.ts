import type { SessionClassTypeOption } from "@/components/admin/admin-schedule-session-class-type-resolve";
import type {
  AdminScheduleClassType,
  AdminScheduleCoach,
  AdminScheduleSession,
  AvailabilityOption,
  TimeOfDayOption,
} from "@/components/admin/admin-schedule-session.types";

export function coachName(coach: AdminScheduleCoach | AdminScheduleSession["coach"]): string {
  if ("lastName" in coach.user) {
    return [coach.user.name, coach.user.lastName].filter(Boolean).join(" ") || coach.user.email;
  }
  return coach.user.name ?? "—";
}

export function spotsLeft(row: AdminScheduleSession): number {
  return Math.max(row.capacity - row._count.bookings, 0);
}

/** Sessions with any bookings must not be hard-deleted (API enforces the same rule). */
export function canDeleteAdminScheduleSession(
  row: Pick<AdminScheduleSession, "_count">,
): boolean {
  return row._count.bookings === 0;
}

export function splitSessionLevels(level: string | null | undefined): string[] {
  if (!level) {
    return [];
  }
  return level
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function matchesAvailability(
  row: AdminScheduleSession,
  selected: readonly AvailabilityOption[],
): boolean {
  if (selected.length === 0) {
    return true;
  }
  const available = spotsLeft(row) > 0;
  const full = spotsLeft(row) === 0;
  return (
    (selected.includes("available") && available) ||
    (selected.includes("full") && full)
  );
}

export function matchesTimeOfDaySelection(
  row: AdminScheduleSession,
  selected: readonly TimeOfDayOption[],
): boolean {
  if (selected.length === 0) {
    return true;
  }
  const hour = new Date(row.startsAt).getHours();
  return (
    (selected.includes("morning") && hour < 12) ||
    (selected.includes("afternoon") && hour >= 12 && hour < 17) ||
    (selected.includes("evening") && hour >= 17)
  );
}

export function buildSessionClassTypeOptions(
  classTypes: readonly AdminScheduleClassType[],
): SessionClassTypeOption[] {
  return classTypes
    .map((type) => ({
      value: type.id,
      label: type.name,
      classTypeId: type.id,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}
