export type { UserListBoardViewMode as UserPackagesViewMode } from "@/lib/user-list-board-view-preference";
export {
  DEFAULT_USER_LIST_BOARD_VIEW_MODE as DEFAULT_USER_PACKAGES_VIEW_MODE,
  parseUserListBoardViewMode as parseUserPackagesViewMode,
} from "@/lib/user-list-board-view-preference";

import {
  readUserListBoardViewFromStorage,
  writeUserListBoardViewToStorage,
  type UserListBoardViewMode,
} from "@/lib/user-list-board-view-preference";

export const USER_PACKAGES_VIEW_STORAGE_KEY = "ommm:user-packages-view";

export function readUserPackagesViewModeFromStorage(): UserListBoardViewMode {
  return readUserListBoardViewFromStorage("packages");
}

export function writeUserPackagesViewModeToStorage(mode: UserListBoardViewMode): void {
  writeUserListBoardViewToStorage("packages", mode);
}
