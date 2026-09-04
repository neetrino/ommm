export type ScheduleLayoutMode = "list" | "week";

export const SCHEDULE_LAYOUT_MODES: readonly ScheduleLayoutMode[] = [
  "list",
  "week",
];

export const DEFAULT_SCHEDULE_LAYOUT_MODE: ScheduleLayoutMode = "week";

export const SCHEDULE_LAYOUT_STORAGE_KEY = "ommm.schedule.layout";

/** Resolves a stored or query layout value to a supported schedule layout. */
export function resolveScheduleLayoutMode(
  value: string | null | undefined,
): ScheduleLayoutMode {
  return value === "list" ? "list" : DEFAULT_SCHEDULE_LAYOUT_MODE;
}

export function readStoredScheduleLayoutMode(): ScheduleLayoutMode {
  if (typeof window === "undefined") {
    return DEFAULT_SCHEDULE_LAYOUT_MODE;
  }
  try {
    return resolveScheduleLayoutMode(
      window.localStorage.getItem(SCHEDULE_LAYOUT_STORAGE_KEY),
    );
  } catch {
    return DEFAULT_SCHEDULE_LAYOUT_MODE;
  }
}

export function writeStoredScheduleLayoutMode(mode: ScheduleLayoutMode): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(SCHEDULE_LAYOUT_STORAGE_KEY, mode);
  } catch {
    // Ignore quota / private-mode failures — preference is best-effort.
  }
}
