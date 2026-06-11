export type ListBoardViewMode = "list" | "board";

/** Default member `/user` view when `?view` is absent (desktop). */
export const DEFAULT_USER_LIST_BOARD_VIEW_MODE: ListBoardViewMode = "list";

/** Card layout on viewports that do not support list mode. */
const LIST_BOARD_VIEW_COMPACT_MODE: ListBoardViewMode = "board";

export const LIST_BOARD_VIEW_QUERY_KEY = "view";

const VALID_MODES: readonly ListBoardViewMode[] = ["list", "board"];

function isListBoardViewMode(value: string | null): value is ListBoardViewMode {
  return value !== null && (VALID_MODES as readonly string[]).includes(value);
}

export function parseListBoardViewMode(
  value: string | null | undefined,
  fallback: ListBoardViewMode = DEFAULT_USER_LIST_BOARD_VIEW_MODE,
): ListBoardViewMode {
  if (value === undefined || value === null) {
    return fallback;
  }
  return isListBoardViewMode(value) ? value : fallback;
}

/** Forces card/board view on viewports that do not support list layout. */
export function resolveEffectiveListBoardViewMode(
  preferred: ListBoardViewMode,
  supportsListView: boolean,
): ListBoardViewMode {
  if (!supportsListView && preferred === "list") {
    return LIST_BOARD_VIEW_COMPACT_MODE;
  }
  return preferred;
}
