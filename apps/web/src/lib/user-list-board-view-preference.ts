import {
  DEFAULT_USER_LIST_BOARD_VIEW_MODE,
  parseListBoardViewMode,
  type ListBoardViewMode,
} from "@/lib/list-board-view";

export type UserListBoardViewMode = ListBoardViewMode;

export { DEFAULT_USER_LIST_BOARD_VIEW_MODE };

export const USER_LIST_BOARD_VIEW_PAGES = {
  packages: true,
  bookings: true,
  waitlists: true,
  classes: true,
  payments: true,
} as const;

export type UserListBoardViewPage = keyof typeof USER_LIST_BOARD_VIEW_PAGES;

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
  return parseListBoardViewMode(value);
}
