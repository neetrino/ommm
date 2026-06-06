"use client";

import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from "react";

const DRAG_MOVE_THRESHOLD_PX = 4;

type DragState = {
  active: boolean;
  startX: number;
  startScrollLeft: number;
  moved: boolean;
};

/**
 * Enables click-drag horizontal scrolling with hidden scrollbars.
 * Suppresses child click handlers when the pointer moved beyond the drag threshold.
 */
export function useHorizontalDragScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<DragState>({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const element = scrollRef.current;
    if (!element || event.button !== 0) return;
    dragState.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: element.scrollLeft,
      moved: false,
    };
    element.setPointerCapture(event.pointerId);
  }, []);

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const element = scrollRef.current;
    if (!element || !dragState.current.active) return;
    const deltaX = event.clientX - dragState.current.startX;
    if (Math.abs(deltaX) > DRAG_MOVE_THRESHOLD_PX) {
      dragState.current.moved = true;
    }
    element.scrollLeft = dragState.current.startScrollLeft - deltaX;
  }, []);

  const endDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const element = scrollRef.current;
    if (!element || !dragState.current.active) return;
    dragState.current.active = false;
    if (element.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }
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
