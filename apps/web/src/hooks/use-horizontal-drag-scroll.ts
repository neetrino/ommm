"use client";

import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from "react";

const DRAG_MOVE_THRESHOLD_PX = 8;

type DragState = {
  active: boolean;
  captured: boolean;
  startX: number;
  startScrollLeft: number;
  moved: boolean;
  pointerType: string;
};

/**
 * Drag-to-scroll on the viewport. Pointer capture starts only after drag threshold
 * so taps on day cards still receive click events.
 */
export function useHorizontalDragScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<DragState>({
    active: false,
    captured: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
    pointerType: "mouse",
  });

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const element = scrollRef.current;
    if (!element || event.button !== 0) return;
    dragState.current = {
      active: true,
      captured: false,
      startX: event.clientX,
      startScrollLeft: element.scrollLeft,
      moved: false,
      pointerType: event.pointerType,
    };
  }, []);

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const element = scrollRef.current;
    if (!element || !dragState.current.active) return;

    const deltaX = event.clientX - dragState.current.startX;
    if (Math.abs(deltaX) <= DRAG_MOVE_THRESHOLD_PX) return;

    dragState.current.moved = true;

    if (dragState.current.pointerType === "mouse" && !dragState.current.captured) {
      element.setPointerCapture(event.pointerId);
      dragState.current.captured = true;
    }

    if (dragState.current.pointerType === "mouse") {
      element.scrollLeft = dragState.current.startScrollLeft - deltaX;
    }
  }, []);

  const endDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const element = scrollRef.current;
    if (!element || !dragState.current.active) return;

    if (dragState.current.pointerType !== "mouse") {
      const scrollDelta = Math.abs(element.scrollLeft - dragState.current.startScrollLeft);
      if (scrollDelta > DRAG_MOVE_THRESHOLD_PX) {
        dragState.current.moved = true;
      }
    }

    dragState.current.active = false;

    if (dragState.current.captured && element.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }
    dragState.current.captured = false;
  }, []);

  const shouldSuppressClick = useCallback(() => {
    const suppress = dragState.current.moved;
    dragState.current.moved = false;
    return suppress;
  }, []);

  return {
    scrollRef,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
    shouldSuppressClick,
  };
}
