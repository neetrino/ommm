export type ScheduleLayoutMode = "list" | "week" | "month";

export const SCHEDULE_LAYOUT_MODES: readonly ScheduleLayoutMode[] = [
  "list",
  "week",
  "month",
];

export const DEFAULT_SCHEDULE_LAYOUT_MODE: ScheduleLayoutMode = "week";

export const SCHEDULE_LAYOUT_STORAGE_KEY = "ommm.schedule.layout";

const layoutModeListeners = new Set<() => void>();

/** Resolves a stored or query layout value to a supported schedule layout. */
export function resolveScheduleLayoutMode(
  value: string | null | undefined,
): ScheduleLayoutMode {
  if (value === "list" || value === "month") {
    return value;
  }
  return DEFAULT_SCHEDULE_LAYOUT_MODE;
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
  for (const listener of layoutModeListeners) {
    listener();
  }
}

/** Subscribe to same-tab + cross-tab schedule layout preference changes. */
export function subscribeScheduleLayoutMode(
  onStoreChange: () => void,
): () => void {
  layoutModeListeners.add(onStoreChange);
  function onStorage(event: StorageEvent): void {
    if (
      event.key === SCHEDULE_LAYOUT_STORAGE_KEY ||
      event.key === null
    ) {
      onStoreChange();
    }
  }
  window.addEventListener("storage", onStorage);
  return () => {
    layoutModeListeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}
