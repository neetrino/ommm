"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_USER_LIST_BOARD_VIEW_MODE,
  readUserListBoardViewFromStorage,
  subscribeUserListBoardView,
  writeUserListBoardViewToStorage,
  type UserListBoardViewMode,
  type UserListBoardViewPage,
} from "@/lib/user-list-board-view-preference";

export function useUserListBoardView(
  page: UserListBoardViewPage,
): [UserListBoardViewMode, (mode: UserListBoardViewMode) => void] {
  const viewMode = useSyncExternalStore(
    subscribeUserListBoardView,
    () => readUserListBoardViewFromStorage(page),
    () => DEFAULT_USER_LIST_BOARD_VIEW_MODE,
  );

  const setView = useCallback(
    (mode: UserListBoardViewMode) => {
      writeUserListBoardViewToStorage(page, mode);
    },
    [page],
  );

  return [viewMode, setView];
}
