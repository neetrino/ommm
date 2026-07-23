"use client";

import { useListBoardViewUrl } from "@/hooks/use-list-board-view-url";
import {
  DEFAULT_USER_LIST_BOARD_VIEW_MODE,
  type UserListBoardViewMode,
  type UserListBoardViewPage,
} from "@/lib/user-list-board-view-preference";
import { DEFAULT_USER_PACKAGES_VIEW_MODE } from "@/lib/user-packages-view-preference";
import { DEFAULT_USER_PAYMENTS_VIEW_MODE } from "@/lib/user-payments-view-preference";

const DEFAULT_VIEW_BY_PAGE: Partial<Record<UserListBoardViewPage, UserListBoardViewMode>> = {
  packages: DEFAULT_USER_PACKAGES_VIEW_MODE,
  payments: DEFAULT_USER_PAYMENTS_VIEW_MODE,
};

/** Member list/board toggle backed by `?view=list|board`. */
export function useUserListBoardView(
  page: UserListBoardViewPage,
): [UserListBoardViewMode, (mode: UserListBoardViewMode) => void] {
  const fallback = DEFAULT_VIEW_BY_PAGE[page] ?? DEFAULT_USER_LIST_BOARD_VIEW_MODE;
  return useListBoardViewUrl(fallback);
}
