export type AdminCoachesViewMode = "list" | "board";

export const ADMIN_COACHES_VIEW_STORAGE_KEY = "ommm.admin.coaches.viewMode";

const VALID_MODES: readonly AdminCoachesViewMode[] = ["list", "board"];

function isAdminCoachesViewMode(value: string | null): value is AdminCoachesViewMode {
  return value !== null && (VALID_MODES as readonly string[]).includes(value);
}

/** Reads persisted coaches view mode; defaults to list when missing or invalid. */
export function readAdminCoachesViewPreference(): AdminCoachesViewMode {
  if (typeof window === "undefined") {
    return "list";
  }
  try {
    const stored = window.localStorage.getItem(ADMIN_COACHES_VIEW_STORAGE_KEY);
    return isAdminCoachesViewMode(stored) ? stored : "list";
  } catch {
    return "list";
  }
}

/** Persists coaches view mode for the admin directory. */
export function persistAdminCoachesViewPreference(mode: AdminCoachesViewMode): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(ADMIN_COACHES_VIEW_STORAGE_KEY, mode);
  } catch {
    /* ignore quota / privacy errors */
  }
}
