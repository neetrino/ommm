"use client";

import {
  resolveEffectiveListBoardViewMode,
  type ListBoardViewMode,
} from "@/lib/list-board-view";
import { useSupportsListBoardView } from "@/hooks/use-supports-list-board-view";

/**
 * Applies the mobile card-only rule to a URL-backed list/board preference.
 * Viewport support starts as `false` (hydration-safe), then syncs after mount.
 */
export function useEffectiveListBoardViewMode<T extends ListBoardViewMode>(
  preferred: T,
): T {
  const supportsListView = useSupportsListBoardView();
  return resolveEffectiveListBoardViewMode(preferred, supportsListView) as T;
}
