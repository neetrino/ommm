"use client";

import { useSyncExternalStore } from "react";
import { useSupportsListBoardView } from "@/hooks/use-supports-list-board-view";
import {
  resolveEffectiveListBoardViewMode,
  type ListBoardViewMode,
} from "@/lib/list-board-view";

function useViewportResolved(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Applies the mobile card-only rule to a URL-backed list/board preference.
 * Before viewport is resolved, keeps the URL value to avoid a board flash on refresh.
 */
export function useEffectiveListBoardViewMode<T extends ListBoardViewMode>(
  preferred: T,
): T {
  const supportsListView = useSupportsListBoardView();
  const viewportResolved = useViewportResolved();

  if (!viewportResolved) {
    return preferred;
  }

  return resolveEffectiveListBoardViewMode(preferred, supportsListView) as T;
}
