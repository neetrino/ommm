"use client";

import { useSupportsListBoardView } from "@/hooks/use-supports-list-board-view";
import {
  resolveEffectiveListBoardViewMode,
  type ListBoardViewMode,
} from "@/lib/list-board-view";

/** Applies the mobile card-only rule to a stored or URL-backed list/board preference. */
export function useEffectiveListBoardViewMode<T extends ListBoardViewMode>(
  preferred: T,
): T {
  const supportsListView = useSupportsListBoardView();
  return resolveEffectiveListBoardViewMode(preferred, supportsListView) as T;
}
