"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_SCHEDULE_LAYOUT_MODE,
  readStoredScheduleLayoutMode,
  type ScheduleLayoutMode,
  subscribeScheduleLayoutMode,
  writeStoredScheduleLayoutMode,
} from "@/lib/schedule-layout-mode";

type UseScheduleLayoutModeResult = {
  layoutMode: ScheduleLayoutMode;
  setLayoutMode: (mode: ScheduleLayoutMode) => void;
};

/** Desktop schedule List / Week / Month preference — persisted in localStorage. */
export function useScheduleLayoutMode(
  enabled: boolean,
): UseScheduleLayoutModeResult {
  const storedMode = useSyncExternalStore(
    subscribeScheduleLayoutMode,
    readStoredScheduleLayoutMode,
    () => DEFAULT_SCHEDULE_LAYOUT_MODE,
  );

  const setLayoutMode = useCallback((mode: ScheduleLayoutMode) => {
    writeStoredScheduleLayoutMode(mode);
  }, []);

  return {
    layoutMode: enabled ? storedMode : "list",
    setLayoutMode,
  };
}
