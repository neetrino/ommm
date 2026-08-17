"use client";

import { useSyncExternalStore } from "react";
import {
  resolveEffectiveScheduleView,
  type ScheduleView,
} from "@/components/admin/admin-schedule-view";
import { useSupportsListBoardView } from "@/hooks/use-supports-list-board-view";

function useViewportResolved(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Applies the mobile card-only rule to schedule preference.
 * Monthly stays available on phones; week board is tablet+ only.
 * Before viewport is resolved, keeps the URL value to avoid a list flash on desktop refresh.
 */
export function useEffectiveScheduleView(preferred: ScheduleView): ScheduleView {
  const supportsDesktopViews = useSupportsListBoardView();
  const viewportResolved = useViewportResolved();

  if (!viewportResolved) {
    return preferred;
  }

  return resolveEffectiveScheduleView(preferred, supportsDesktopViews);
}
