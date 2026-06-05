"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_USER_LIST_BOARD_VIEW_MODE,
  readUserListBoardViewFromStorage,
  writeUserListBoardViewToStorage,
  type UserListBoardViewMode,
  type UserListBoardViewPage,
} from "@/lib/user-list-board-view-preference";

export function useUserListBoardView(
  page: UserListBoardViewPage,
): [UserListBoardViewMode, (mode: UserListBoardViewMode) => void] {
  const [viewMode, setViewMode] = useState<UserListBoardViewMode>(
    DEFAULT_USER_LIST_BOARD_VIEW_MODE,
  );

  useEffect(() => {
    setViewMode(readUserListBoardViewFromStorage(page));
  }, [page]);

  const setView = useCallback(
    (mode: UserListBoardViewMode) => {
      setViewMode(mode);
      writeUserListBoardViewToStorage(page, mode);
    },
    [page],
  );

  return [viewMode, setView];
}
