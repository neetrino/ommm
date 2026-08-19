"use client";

import { useCallback, type MutableRefObject, type PointerEvent } from "react";
import { SPHERE_DRAG_CLICK_SUPPRESS_PX } from "@/components/ui/sphere-image-grid.constants";
import { rotationFromPointerDelta } from "@/components/ui/sphere-image-grid.physics";
import type { RotationState, VelocityState } from "@/components/ui/sphere-image-grid.types";

export type SpherePointerHandlers = {
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void;
};

type SpherePointerArgs = {
  draggingRef: MutableRefObject<boolean>;
  dragDistanceRef: MutableRefObject<number>;
  lastPointerRef: MutableRefObject<{ x: number; y: number }>;
  rotationRef: MutableRefObject<RotationState>;
  velocityRef: MutableRefObject<VelocityState>;
  setIsDragging: (value: boolean) => void;
  startLoop: () => void;
  syncRotation: (next: RotationState) => void;
};

export function useSpherePointerHandlers({
  draggingRef,
  dragDistanceRef,
  lastPointerRef,
  rotationRef,
  velocityRef,
  setIsDragging,
  startLoop,
  syncRotation,
}: SpherePointerArgs): { didDrag: () => boolean; handlers: SpherePointerHandlers } {
  const applyDelta = useCallback(
    (clientX: number, clientY: number) => {
      const deltaX = clientX - lastPointerRef.current.x;
      const deltaY = clientY - lastPointerRef.current.y;
      dragDistanceRef.current += Math.hypot(deltaX, deltaY);
      const next = rotationFromPointerDelta(rotationRef.current, deltaX, deltaY);
      velocityRef.current = next.velocity;
      syncRotation(next.rotation);
      lastPointerRef.current = { x: clientX, y: clientY };
    },
    [dragDistanceRef, lastPointerRef, rotationRef, syncRotation, velocityRef],
  );

  const endDrag = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) {
        return;
      }
      draggingRef.current = false;
      setIsDragging(false);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      startLoop();
    },
    [draggingRef, setIsDragging, startLoop],
  );

  const handlers: SpherePointerHandlers = {
    onPointerDown: (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      draggingRef.current = true;
      setIsDragging(true);
      dragDistanceRef.current = 0;
      velocityRef.current = { x: 0, y: 0 };
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event) => {
      if (draggingRef.current) {
        applyDelta(event.clientX, event.clientY);
      }
    },
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };

  return {
    didDrag: () => dragDistanceRef.current > SPHERE_DRAG_CLICK_SUPPRESS_PX,
    handlers,
  };
}
