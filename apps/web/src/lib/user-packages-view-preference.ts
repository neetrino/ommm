export type UserPackagesViewMode = "list" | "board";

export const USER_PACKAGES_VIEW_STORAGE_KEY = "ommm:user-packages-view";
export const DEFAULT_USER_PACKAGES_VIEW_MODE: UserPackagesViewMode = "board";

const VALID_MODES: readonly UserPackagesViewMode[] = ["list", "board"];

function isUserPackagesViewMode(value: string | null): value is UserPackagesViewMode {
  return value !== null && (VALID_MODES as readonly string[]).includes(value);
}

export function parseUserPackagesViewMode(value: string | null | undefined): UserPackagesViewMode {
  if (value === undefined || value === null) {
    return DEFAULT_USER_PACKAGES_VIEW_MODE;
  }
  return isUserPackagesViewMode(value) ? value : DEFAULT_USER_PACKAGES_VIEW_MODE;
}

export function readUserPackagesViewModeFromStorage(): UserPackagesViewMode {
  if (typeof window === "undefined") {
    return DEFAULT_USER_PACKAGES_VIEW_MODE;
  }
  try {
    return parseUserPackagesViewMode(window.localStorage.getItem(USER_PACKAGES_VIEW_STORAGE_KEY));
  } catch {
    return DEFAULT_USER_PACKAGES_VIEW_MODE;
  }
}

export function writeUserPackagesViewModeToStorage(mode: UserPackagesViewMode): void {
  try {
    window.localStorage.setItem(USER_PACKAGES_VIEW_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}
