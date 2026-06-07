"use client";

import { useListBoardViewUrl } from "@/hooks/use-list-board-view-url";
import {
  type UserListBoardViewMode,
  type UserListBoardViewPage,
} from "@/lib/user-list-board-view-preference";

/** Member list/board toggle backed by `?view=list|board`. */
export function useUserListBoardView(
  page: UserListBoardViewPage,
): [UserListBoardViewMode, (mode: UserListBoardViewMode) => void] {
  void page;
  return useListBoardViewUrl();
}
