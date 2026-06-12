"use client";

import { useSyncExternalStore } from "react";
import {
  peekMemberHubSheetScrollY,
  subscribeMemberHubSheetNavigation,
} from "@/lib/member-hub-sheet-navigation";

/**
 * True when a hub section sheet opened from a scrolled account hub —
 * keep the existing hub in `children` instead of swapping in a backdrop copy.
 */
export function usePreserveScrolledMemberHub(hasMobileSheet: boolean): boolean {
  return useSyncExternalStore(
    subscribeMemberHubSheetNavigation,
    () => hasMobileSheet && peekMemberHubSheetScrollY() !== null,
    () => false,
  );
}
