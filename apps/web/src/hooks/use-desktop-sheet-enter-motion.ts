"use client";

import { useCallback, useLayoutEffect, useState } from "react";

type SheetMotionState = "open" | "closed";

type DesktopSheetEnterMotion = {
  motionState: SheetMotionState;
  closeMotion: () => void;
};

/** Desktop sheet enter animation — closed first frame, then open on the next. */
export function useDesktopSheetEnterMotion(
  enabled: boolean,
  animationKey?: string | number,
): DesktopSheetEnterMotion {
  const [motionState, setMotionState] = useState<SheetMotionState>("closed");

  useLayoutEffect(() => {
    if (!enabled) {
      setMotionState("closed");
      return undefined;
    }

    setMotionState("closed");
    let openFrame: number | undefined;
    const closedFrame = requestAnimationFrame(() => {
      openFrame = requestAnimationFrame(() => {
        setMotionState("open");
      });
    });

    return () => {
      cancelAnimationFrame(closedFrame);
      if (openFrame !== undefined) {
        cancelAnimationFrame(openFrame);
      }
    };
  }, [animationKey, enabled]);

  const closeMotion = useCallback(() => {
    setMotionState("closed");
  }, []);

  return { motionState, closeMotion };
}
