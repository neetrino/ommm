"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const OVERLAY_ENTER_EXIT_ENTER_MS = 320;
export const OVERLAY_ENTER_EXIT_EXIT_MS = 300;

function scheduleMotionFrame(callback: () => void): number {
  return window.requestAnimationFrame(() => {
    window.requestAnimationFrame(callback);
  });
}

type UseOverlayEnterExitMotionResult = {
  presented: boolean;
  motionOpen: boolean;
  requestClose: () => void;
};

/**
 * Keeps an overlay mounted through exit animation, then calls `onClosed`.
 */
export function useOverlayEnterExitMotion(
  open: boolean,
  onClosed: () => void,
  options?: { closeDisabled?: boolean },
): UseOverlayEnterExitMotionResult {
  const closeDisabled = options?.closeDisabled ?? false;
  const closingRef = useRef(false);
  const exitTimerRef = useRef<number | undefined>(undefined);
  const openFrameRef = useRef<number | undefined>(undefined);
  const [presented, setPresented] = useState(false);
  const [motionOpen, setMotionOpen] = useState(false);

  const finishClose = useCallback(() => {
    closingRef.current = false;
    setPresented(false);
    setMotionOpen(false);
    onClosed();
  }, [onClosed]);

  const requestClose = useCallback(() => {
    if (closingRef.current || !presented || closeDisabled) {
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
    }, OVERLAY_ENTER_EXIT_EXIT_MS);
  }, [closeDisabled, finishClose, presented]);

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
