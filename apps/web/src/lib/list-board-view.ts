export type ListBoardViewMode = "list" | "board";

export const DEFAULT_USER_LIST_BOARD_VIEW_MODE: ListBoardViewMode = "board";

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
    return DEFAULT_USER_LIST_BOARD_VIEW_MODE;
  }
  return preferred;
}
