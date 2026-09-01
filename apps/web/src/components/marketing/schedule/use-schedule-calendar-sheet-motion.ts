"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Match mobile app `useBottomSheetSlideMotion` enter timing. */
export const SCHEDULE_CALENDAR_SHEET_ENTER_MS = 320;
/** Match mobile app `useBottomSheetSlideMotion` exit timing. */
export const SCHEDULE_CALENDAR_SHEET_EXIT_MS = 300;

function scheduleMotionFrame(callback: () => void): number {
  return window.requestAnimationFrame(() => {
    window.requestAnimationFrame(callback);
  });
}

type UseScheduleCalendarSheetMotionResult = {
  presented: boolean;
  motionOpen: boolean;
  requestClose: () => void;
};

/**
 * Keeps the calendar sheet mounted through slide-down exit, then calls `onClose`.
 */
export function useScheduleCalendarSheetMotion(
  open: boolean,
  onClose: () => void,
): UseScheduleCalendarSheetMotionResult {
  const closingRef = useRef(false);
  const exitTimerRef = useRef<number | undefined>(undefined);
  const openFrameRef = useRef<number | undefined>(undefined);
  const [presented, setPresented] = useState(false);
  const [motionOpen, setMotionOpen] = useState(false);

  const finishClose = useCallback(() => {
    closingRef.current = false;
    setPresented(false);
    setMotionOpen(false);
    onClose();
  }, [onClose]);

  const requestClose = useCallback(() => {
    if (closingRef.current || !presented) {
      return;
    }
    closingRef.current = true;
    setMotionOpen(false);
    if (exitTimerRef.current !== undefined) {
      window.clearTimeout(exitTimerRef.current);
    }
    exitTimerRef.current = window.setTimeout(() => {
      exitTimerRef.current = undefined;
      finishClose();
    }, SCHEDULE_CALENDAR_SHEET_EXIT_MS);
  }, [finishClose, presented]);

  useEffect(() => {
    if (!open) {
      return;
    }
    closingRef.current = false;
    if (exitTimerRef.current !== undefined) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = undefined;
    }
    setPresented(true);
    setMotionOpen(false);
    openFrameRef.current = scheduleMotionFrame(() => {
      setMotionOpen(true);
      openFrameRef.current = undefined;
    });
    return () => {
      if (openFrameRef.current !== undefined) {
        window.cancelAnimationFrame(openFrameRef.current);
      }
    };
  }, [open]);

  useEffect(() => {
    if (open || !presented || closingRef.current) {
      return;
    }
    requestClose();
  }, [open, presented, requestClose]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current !== undefined) {
        window.clearTimeout(exitTimerRef.current);
      }
      if (openFrameRef.current !== undefined) {
        window.cancelAnimationFrame(openFrameRef.current);
      }
    };
  }, []);

  return { presented, motionOpen, requestClose };
}
