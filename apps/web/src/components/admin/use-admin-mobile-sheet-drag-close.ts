"use client";

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  ADMIN_MOBILE_SHEET_DRAG_START_THRESHOLD_PX,
  shouldCloseFromSheetDrag,
} from "@/components/admin/admin-mobile-sheet-layout";

type DragSession = {
  pointerId: number | null;
  startY: number;
  startTimeMs: number;
};

const IDLE_DRAG: DragSession = {
  pointerId: null,
  startY: 0,
  startTimeMs: 0,
};

type UseAdminMobileSheetDragCloseResult = {
  dragOffsetPx: number;
  isDragging: boolean;
  grabberHandlers: {
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
  };
};

/** Drag the mobile sheet grabber down to dismiss. */
export function useAdminMobileSheetDragClose(
  enabled: boolean,
  onClose: () => void,
): UseAdminMobileSheetDragCloseResult {
  const dragRef = useRef<DragSession>(IDLE_DRAG);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled || event.button !== 0) {
        return;
      }
      dragRef.current = {
        pointerId: event.pointerId,
        startY: event.clientY,
        startTimeMs: event.timeStamp,
      };
      setIsDragging(true);
      setDragOffsetPx(0);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [enabled],
  );

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) {
      return;
    }
    setDragOffsetPx(Math.max(0, event.clientY - dragRef.current.startY));
  }, []);

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (dragRef.current.pointerId !== event.pointerId) {
        return;
      }
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      const deltaY = Math.max(0, event.clientY - dragRef.current.startY);
      const elapsedMs = event.timeStamp - dragRef.current.startTimeMs;
      const closeSheet =
        deltaY >= ADMIN_MOBILE_SHEET_DRAG_START_THRESHOLD_PX &&
        shouldCloseFromSheetDrag(deltaY, elapsedMs);
      dragRef.current = IDLE_DRAG;
      setIsDragging(false);
      setDragOffsetPx(0);
      if (closeSheet) {
        onClose();
      }
    },
    [onClose],
  );

  return {
    dragOffsetPx,
    isDragging,
    grabberHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
