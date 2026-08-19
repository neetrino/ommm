"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SPHERE_INITIAL_ROTATION } from "@/components/ui/sphere-image-grid.constants";
import { useSphereAnimationLoop } from "@/components/ui/sphere-image-grid.use-loop";
import {
  useSpherePointerHandlers,
  type SpherePointerHandlers,
} from "@/components/ui/sphere-image-grid.use-pointer";
import type { RotationState, VelocityState } from "@/components/ui/sphere-image-grid.types";

export function useSphereImageGridRotation(autoRotate: boolean): {
  rotation: RotationState;
  isDragging: boolean;
  didDrag: () => boolean;
  handlers: SpherePointerHandlers;
} {
  const [rotation, setRotation] = useState<RotationState>(SPHERE_INITIAL_ROTATION);
  const [isDragging, setIsDragging] = useState(false);
  const rotationRef = useRef<RotationState>(SPHERE_INITIAL_ROTATION);
  const velocityRef = useRef<VelocityState>({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const autoRotateRef = useRef(autoRotate);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const dragDistanceRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  const syncRotation = useCallback((next: RotationState) => {
    rotationRef.current = next;
    setRotation(next);
  }, []);

  const startLoop = useSphereAnimationLoop({
    autoRotate,
    autoRotateRef,
    draggingRef,
    frameRef,
    rotationRef,
    velocityRef,
    syncRotation,
  });

  const { didDrag, handlers } = useSpherePointerHandlers({
    draggingRef,
    dragDistanceRef,
    lastPointerRef,
    rotationRef,
    velocityRef,
    setIsDragging,
    startLoop,
    syncRotation,
  });

  return { rotation, isDragging, didDrag, handlers };
}
