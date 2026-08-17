"use client";

import { useUrlViewState } from "@/hooks/use-url-view-state";
import {
  resolveScheduleView,
  type ScheduleView,
} from "@/components/admin/admin-schedule-view";
import { LIST_BOARD_VIEW_QUERY_KEY } from "@/lib/list-board-view";

/** Keeps schedule list/week/month mode in the URL (`?view=list|weekly|monthly`). */
export function useScheduleViewUrl(
  fallbackView: ScheduleView,
): [ScheduleView, (view: ScheduleView) => void] {
  return useUrlViewState(LIST_BOARD_VIEW_QUERY_KEY, (value) => {
    if (value === null) {
      return fallbackView;
    }
    return resolveScheduleView(value);
  });
}
