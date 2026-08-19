"use client";

import { useCallback, useEffect, type MutableRefObject } from "react";
import {
  decayVelocity,
  nextIdleRotation,
  shouldKeepAnimating,
} from "@/components/ui/sphere-image-grid.physics";
import type { RotationState, VelocityState } from "@/components/ui/sphere-image-grid.types";

type SphereAnimationLoopArgs = {
  autoRotate: boolean;
  autoRotateRef: MutableRefObject<boolean>;
  draggingRef: MutableRefObject<boolean>;
  frameRef: MutableRefObject<number | null>;
  rotationRef: MutableRefObject<RotationState>;
  velocityRef: MutableRefObject<VelocityState>;
  syncRotation: (next: RotationState) => void;
};

export function useSphereAnimationLoop({
  autoRotate,
  autoRotateRef,
  draggingRef,
  frameRef,
  rotationRef,
  velocityRef,
  syncRotation,
}: SphereAnimationLoopArgs): () => void {
  const startLoop = useCallback(() => {
    if (frameRef.current !== null) {
      return;
    }
    const tick = () => {
      if (!draggingRef.current) {
        velocityRef.current = decayVelocity(velocityRef.current);
        syncRotation(
          nextIdleRotation(rotationRef.current, velocityRef.current, autoRotateRef.current),
        );
      }
      if (shouldKeepAnimating(draggingRef.current, autoRotateRef.current, velocityRef.current)) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }
      frameRef.current = null;
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [autoRotateRef, draggingRef, frameRef, rotationRef, syncRotation, velocityRef]);

  useEffect(() => {
    if (autoRotate) {
      startLoop();
    }
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [autoRotate, frameRef, startLoop]);

  return startLoop;
}
