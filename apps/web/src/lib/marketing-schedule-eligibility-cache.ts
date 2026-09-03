import {
  buildScheduleSessionEligibilityMap,
  type ScheduleSessionEligibilityMap,
  type ScheduleSessionEligibilityRow,
} from "@/lib/schedule-session-eligibility";

const CACHE_KEY = "ommm_marketing_schedule_eligibility_v1";
export const MARKETING_SCHEDULE_ELIGIBILITY_UPDATED =
  "ommm-marketing-schedule-eligibility-updated";

const EMPTY_MAP: ScheduleSessionEligibilityMap = new Map();

let clientSnapshot: ScheduleSessionEligibilityMap = EMPTY_MAP;
let storageHydrated = false;

function isEligibilityRow(value: unknown): value is ScheduleSessionEligibilityRow {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const row = value as Record<string, unknown>;
  return (
    typeof row.sessionId === "string" &&
    (row.status === "included" || row.status === "purchase_required") &&
    typeof row.classTypeName === "string"
  );
}

function hydrateClientSnapshotFromStorage(): void {
  if (storageHydrated || typeof sessionStorage === "undefined") {
    return;
  }
  storageHydrated = true;
  const raw = sessionStorage.getItem(CACHE_KEY);
  if (raw === null || raw === "") {
    return;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isEligibilityRow)) {
      return;
    }
    clientSnapshot = buildScheduleSessionEligibilityMap(parsed);
  } catch {
    // Keep empty snapshot when storage is corrupt.
  }
}

export function getMarketingScheduleEligibilityClientSnapshot(): ScheduleSessionEligibilityMap {
  hydrateClientSnapshotFromStorage();
  return clientSnapshot;
}

export function getMarketingScheduleEligibilityServerSnapshot(): ScheduleSessionEligibilityMap {
  return EMPTY_MAP;
}

export function writeCachedMarketingScheduleEligibility(
  rows: readonly ScheduleSessionEligibilityRow[],
): void {
  storageHydrated = true;
  clientSnapshot = buildScheduleSessionEligibilityMap(rows);
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(rows));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MARKETING_SCHEDULE_ELIGIBILITY_UPDATED));
  }
}

export function clearCachedMarketingScheduleEligibility(): void {
  storageHydrated = true;
  clientSnapshot = EMPTY_MAP;
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.removeItem(CACHE_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MARKETING_SCHEDULE_ELIGIBILITY_UPDATED));
  }
}
