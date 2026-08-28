"use client";

import {
  resolveEffectiveScheduleView,
  type ScheduleView,
} from "@/components/admin/admin-schedule-view";
import { useSupportsListBoardView } from "@/hooks/use-supports-list-board-view";

/**
 * Applies the mobile card-only rule to schedule preference.
 * Monthly stays available on phones; week board is tablet+ only.
 * Viewport support starts as `false` (hydration-safe), then syncs after mount.
 */
export function useEffectiveScheduleView(preferred: ScheduleView): ScheduleView {
  const supportsDesktopViews = useSupportsListBoardView();
  return resolveEffectiveScheduleView(preferred, supportsDesktopViews);
}
