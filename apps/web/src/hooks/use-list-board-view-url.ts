"use client";

import { useEffectiveListBoardViewMode } from "@/hooks/use-effective-list-board-view-mode";
import { useUrlViewState } from "@/hooks/use-url-view-state";
import {
  LIST_BOARD_VIEW_QUERY_KEY,
  parseListBoardViewMode,
  type ListBoardViewMode,
} from "@/lib/list-board-view";

/** Keeps list/board mode in the URL (`?view=list|board`). */
export function useListBoardViewUrl(
  fallbackMode?: ListBoardViewMode,
): [ListBoardViewMode, (mode: ListBoardViewMode) => void] {
  const [preferredMode, setView] = useUrlViewState(
    LIST_BOARD_VIEW_QUERY_KEY,
    (value) => parseListBoardViewMode(value, fallbackMode),
  );
  const viewMode = useEffectiveListBoardViewMode(preferredMode);

  return [viewMode, setView];
}
