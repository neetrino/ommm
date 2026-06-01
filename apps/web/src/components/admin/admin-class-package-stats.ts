import type {
  AdminClassPackageCoachRow,
  AdminClassPackageSessionRow,
  AdminClassTypeRow,
  ClassPackageSessionStats,
  EnrichedClassPackage,
} from "@/components/admin/admin-class-packages-types";

export const HIGH_CAPACITY_THRESHOLD = 10;
export const LOW_CAPACITY_THRESHOLD = 4;

export function buildSessionStatsByTypeId(
  sessions: readonly AdminClassPackageSessionRow[],
): Map<string, ClassPackageSessionStats> {
  const map = new Map<string, ClassPackageSessionStats>();

  for (const session of sessions) {
    const current = map.get(session.classTypeId) ?? emptySessionStats();
    const levels = session.level?.trim()
      ? [...current.levels, session.level.trim()]
      : current.levels;
    const uniqueLevels = [...new Set(levels)];

    map.set(session.classTypeId, {
      sessionCount: current.sessionCount + 1,
      levels: uniqueLevels,
      maxCapacity:
        current.maxCapacity === null
          ? session.capacity
          : Math.max(current.maxCapacity, session.capacity),
      minCapacity:
        current.minCapacity === null
          ? session.capacity
          : Math.min(current.minCapacity, session.capacity),
      maxPriceCents:
        current.maxPriceCents === null
          ? session.priceCents
          : Math.max(current.maxPriceCents, session.priceCents),
      minPriceCents:
        current.minPriceCents === null
          ? session.priceCents
          : Math.min(current.minPriceCents, session.priceCents),
      totalBookings: current.totalBookings + session._count.bookings,
    });
  }

  return map;
}

function emptySessionStats(): ClassPackageSessionStats {
  return {
    sessionCount: 0,
    levels: [],
    maxCapacity: null,
    minCapacity: null,
    maxPriceCents: null,
    minPriceCents: null,
    totalBookings: 0,
  };
}

export function coachesForClassType(
  coaches: readonly AdminClassPackageCoachRow[],
  classType: AdminClassTypeRow,
): AdminClassPackageCoachRow[] {
  return coaches.filter(
    (coach) =>
      coach.assignedClassTypeIds.includes(classType.id) ||
      (coach.classType !== null &&
        coach.classType.toLowerCase() === classType.name.toLowerCase()),
  );
}

export function enrichClassPackages(
  types: readonly AdminClassTypeRow[],
  coaches: readonly AdminClassPackageCoachRow[],
  sessions: readonly AdminClassPackageSessionRow[],
): EnrichedClassPackage[] {
  const statsByType = buildSessionStatsByTypeId(sessions);

  return types.map((type) => ({
    ...type,
    sessionStats: statsByType.get(type.id) ?? emptySessionStats(),
    assignedCoaches: coachesForClassType(coaches, type),
  }));
}

export function levelMatchesFilter(levels: readonly string[], filter: string): boolean {
  if (filter.trim().length === 0) {
    return true;
  }
  const needle = filter.trim().toLowerCase();
  return levels.some((level) => level.toLowerCase().includes(needle));
}

export function hasLevelKeyword(levels: readonly string[], keyword: string): boolean {
  const needle = keyword.toLowerCase();
  return levels.some((level) => level.toLowerCase().includes(needle));
}
