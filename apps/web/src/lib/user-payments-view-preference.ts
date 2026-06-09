import type { UserListBoardViewMode } from "@/lib/user-list-board-view-preference";

export type { UserListBoardViewMode as UserPaymentsViewMode } from "@/lib/user-list-board-view-preference";

/** Member payments page opens in list view on desktop when `?view` is absent. */
export const DEFAULT_USER_PAYMENTS_VIEW_MODE: UserListBoardViewMode = "list";
