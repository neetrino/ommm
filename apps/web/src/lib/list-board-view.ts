import { DEFAULT_USER_LIST_BOARD_VIEW_MODE } from "@/lib/user-list-board-view-preference";

export type ListBoardViewMode = "list" | "board";

/** Forces card/board view on viewports that do not support list layout. */
export function resolveEffectiveListBoardViewMode(
  preferred: ListBoardViewMode,
  supportsListView: boolean,
): ListBoardViewMode {
  if (!supportsListView && preferred === "list") {
    return DEFAULT_USER_LIST_BOARD_VIEW_MODE;
  }
  return preferred;
}
