export type UserListBoardViewMode = "list" | "board";

export const DEFAULT_USER_LIST_BOARD_VIEW_MODE: UserListBoardViewMode = "board";

export const USER_LIST_BOARD_VIEW_STORAGE_KEYS = {
  packages: "ommm:user-packages-view",
  bookings: "ommm:user-bookings-view",
  waitlists: "ommm:user-waitlists-view",
  classes: "ommm:user-classes-view",
  payments: "ommm:user-payments-view",
} as const;

export type UserListBoardViewPage = keyof typeof USER_LIST_BOARD_VIEW_STORAGE_KEYS;

const VALID_MODES: readonly UserListBoardViewMode[] = ["list", "board"];

const viewPreferenceListeners = new Set<() => void>();

function isUserListBoardViewMode(value: string | null): value is UserListBoardViewMode {
  return value !== null && (VALID_MODES as readonly string[]).includes(value);
}

export function userListBoardViewSwitcherId(page: UserListBoardViewPage): string {
  return `user-view-switcher-${page}`;
}

export function userListBoardViewButtonId(
  page: UserListBoardViewPage,
  mode: UserListBoardViewMode,
): string {
  return `user-view-${page}-${mode}`;
}

export function parseUserListBoardViewMode(
  value: string | null | undefined,
): UserListBoardViewMode {
  if (value === undefined || value === null) {
    return DEFAULT_USER_LIST_BOARD_VIEW_MODE;
  }
  return isUserListBoardViewMode(value) ? value : DEFAULT_USER_LIST_BOARD_VIEW_MODE;
}

export function readUserListBoardViewFromStorage(
  page: UserListBoardViewPage,
): UserListBoardViewMode {
  if (typeof window === "undefined") {
    return DEFAULT_USER_LIST_BOARD_VIEW_MODE;
  }
  try {
    return parseUserListBoardViewMode(
      window.localStorage.getItem(USER_LIST_BOARD_VIEW_STORAGE_KEYS[page]),
    );
  } catch {
    return DEFAULT_USER_LIST_BOARD_VIEW_MODE;
  }
}

export function subscribeUserListBoardView(onStoreChange: () => void): () => void {
  viewPreferenceListeners.add(onStoreChange);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStoreChange);
  }
  return () => {
    viewPreferenceListeners.delete(onStoreChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStoreChange);
    }
  };
}

function notifyUserListBoardViewChange(): void {
  viewPreferenceListeners.forEach((listener) => {
    listener();
  });
}

export function writeUserListBoardViewToStorage(
  page: UserListBoardViewPage,
  mode: UserListBoardViewMode,
): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(USER_LIST_BOARD_VIEW_STORAGE_KEYS[page], mode);
    notifyUserListBoardViewChange();
  } catch {
    /* ignore */
  }
}
