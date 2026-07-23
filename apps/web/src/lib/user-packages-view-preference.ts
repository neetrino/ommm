import type { UserListBoardViewMode } from "@/lib/user-list-board-view-preference";

export type { UserListBoardViewMode as UserPackagesViewMode } from "@/lib/user-list-board-view-preference";
export { parseUserListBoardViewMode as parseUserPackagesViewMode } from "@/lib/user-list-board-view-preference";

/** Member packages page opens in list view on desktop when `?view` is absent. */
export const DEFAULT_USER_PACKAGES_VIEW_MODE: UserListBoardViewMode = "list";
