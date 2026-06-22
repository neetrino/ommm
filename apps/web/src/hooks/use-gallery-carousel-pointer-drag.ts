"use client";

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type DragState = {
  active: boolean;
  captured: boolean;
  startX: number;
  moved: boolean;
};

type UseGalleryCarouselPointerDragOptions = {
  stepPx: number;
  enabled: boolean;
  dragStartThresholdPx: number;
  dragCommitRatio: number;
  onPrev: () => void;
  onNext: () => void;
};

/**
 * Pointer drag / swipe for transform-based peek carousels.
 * Follows the finger during drag; commits to prev/next on release past threshold.
 */
export function useGalleryCarouselPointerDrag({
  stepPx,
  enabled,
  dragStartThresholdPx,
  dragCommitRatio,
  onPrev,
  onNext,
}: UseGalleryCarouselPointerDragOptions) {
  const dragState = useRef<DragState>({
    active: false,
    captured: false,
    startX: 0,
    moved: false,
  });
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled || event.button !== 0) {
        return;
      }
      dragState.current = {
        active: true,
        captured: false,
        startX: event.clientX,
        moved: false,
      };
      setIsDragging(true);
      setDragOffsetPx(0);
    },
    [enabled],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragState.current.active) {
        return;
      }
      const deltaX = event.clientX - dragState.current.startX;
      if (!dragState.current.moved && Math.abs(deltaX) < dragStartThresholdPx) {
        return;
      }
      dragState.current.moved = true;
      if (!dragState.current.captured) {
        event.currentTarget.setPointerCapture(event.pointerId);
        dragState.current.captured = true;
      }
      event.preventDefault();
      setDragOffsetPx(deltaX);
    },
    [dragStartThresholdPx],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragState.current.active) {
        return;
      }
      const deltaX = event.clientX - dragState.current.startX;
      const moved = dragState.current.moved;
      const commitThreshold = Math.max(40, stepPx * dragCommitRatio);

      if (dragState.current.captured && event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      dragState.current = {
        active: false,
        captured: false,
        startX: 0,
        moved: false,
      };
      setIsDragging(false);

      if (!enabled || !moved) {
        setDragOffsetPx(0);
        return;
      }
      if (deltaX <= -commitThreshold) {
        setDragOffsetPx(0);
        onNext();
        return;
      }
      if (deltaX >= commitThreshold) {
        setDragOffsetPx(0);
        onPrev();
        return;
      }

      requestAnimationFrame(() => {
        setDragOffsetPx(0);
      });
    },
    [dragCommitRatio, enabled, onNext, onPrev, stepPx],
  );

  return {
    dragOffsetPx,
    isDragging,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
