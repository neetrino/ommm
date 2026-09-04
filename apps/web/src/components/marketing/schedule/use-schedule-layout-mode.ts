"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_SCHEDULE_LAYOUT_MODE,
  readStoredScheduleLayoutMode,
  type ScheduleLayoutMode,
  writeStoredScheduleLayoutMode,
} from "@/lib/schedule-layout-mode";

type UseScheduleLayoutModeResult = {
  layoutMode: ScheduleLayoutMode;
  setLayoutMode: (mode: ScheduleLayoutMode) => void;
};

/** Desktop schedule List / Week preference — persisted in localStorage. */
export function useScheduleLayoutMode(
  enabled: boolean,
): UseScheduleLayoutModeResult {
  const [layoutMode, setLayoutModeState] = useState<ScheduleLayoutMode>(
    DEFAULT_SCHEDULE_LAYOUT_MODE,
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }
    setLayoutModeState(readStoredScheduleLayoutMode());
  }, [enabled]);

  const setLayoutMode = useCallback(
    (mode: ScheduleLayoutMode) => {
      setLayoutModeState(mode);
      if (enabled) {
        writeStoredScheduleLayoutMode(mode);
      }
    },
    [enabled],
  );

  return {
    layoutMode: enabled ? layoutMode : "list",
    setLayoutMode,
  };
}
