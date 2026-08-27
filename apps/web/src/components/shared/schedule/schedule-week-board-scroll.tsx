"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  SCHEDULE_WEEK_EDGE_ZONE_WIDTH_PX,
  SCHEDULE_WEEK_SCROLL_SPEED_PX,
} from "@/components/shared/schedule/schedule-week-view-tokens";
import { useHorizontalDragScroll } from "@/hooks/use-horizontal-drag-scroll";

function ScheduleWeekScrollChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 text-sage-600"
      aria-hidden
    >
      {direction === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

type UseScheduleWeekBoardScrollResult = {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  renderEdgeZones: () => ReactNode;
  /** Align a day column's left edge to the scroll viewport start. */
  scrollDayToStart: (dayKey: string) => void;
  dragHandlers: ReturnType<typeof useHorizontalDragScroll>["dragHandlers"];
  shouldSuppressClick: () => boolean;
};

export function useScheduleWeekBoardScroll(
  dependencyKey: string | number,
  onScroll?: () => void,
): UseScheduleWeekBoardScrollResult {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { dragHandlers, shouldSuppressClick } = useHorizontalDragScroll(scrollRef);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const autoScrollDir = useRef<"left" | "right" | null>(null);
  const rafId = useRef<number>(0);
  const onScrollRef = useRef(onScroll);
  onScrollRef.current = onScroll;

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    setCanScrollLeft(element.scrollLeft > 2);
    setCanScrollRight(element.scrollLeft < element.scrollWidth - element.clientWidth - 2);
    onScrollRef.current?.();
  }, []);

  const scrollDayToStart = useCallback(
    (dayKey: string) => {
      const container = scrollRef.current;
      if (!container) return;
      const target = container.querySelector(`[data-schedule-day="${dayKey}"]`);
      if (!(target instanceof HTMLElement)) {
        container.scrollLeft = 0;
        updateScrollState();
        return;
      }
      const containerLeft = container.getBoundingClientRect().left;
      const targetLeft = target.getBoundingClientRect().left;
      container.scrollLeft += targetLeft - containerLeft;
      updateScrollState();
    },
    [updateScrollState],
  );

  const startAutoScroll = useCallback(
    (direction: "left" | "right") => {
      autoScrollDir.current = direction;
      const tick = () => {
        const element = scrollRef.current;
        if (!element || !autoScrollDir.current) return;
        element.scrollLeft +=
          autoScrollDir.current === "left"
            ? -SCHEDULE_WEEK_SCROLL_SPEED_PX
            : SCHEDULE_WEEK_SCROLL_SPEED_PX;
        updateScrollState();
        rafId.current = requestAnimationFrame(tick);
      };
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(tick);
    },
    [updateScrollState],
  );

  const stopAutoScroll = useCallback(() => {
    autoScrollDir.current = null;
    cancelAnimationFrame(rafId.current);
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    updateScrollState();
    element.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [dependencyKey, updateScrollState]);

  useEffect(() => () => cancelAnimationFrame(rafId.current), []);

  const renderEdgeZone = (side: "left" | "right", canScroll: boolean) => (
    <div
      onMouseEnter={() => canScroll && startAutoScroll(side)}
      onMouseLeave={stopAutoScroll}
      className={`pointer-events-none absolute top-0 z-20 flex h-full items-center ${
        side === "left" ? "left-0" : "right-0"
      }`}
      style={{ width: SCHEDULE_WEEK_EDGE_ZONE_WIDTH_PX }}
    >
      <div
        className={`flex h-full w-full items-center justify-center transition-opacity duration-200 ${
          canScroll ? "pointer-events-auto opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-sage-800/15 bg-sand-50/95 text-sage-700 shadow-sm">
          <ScheduleWeekScrollChevron direction={side} />
        </div>
      </div>
    </div>
  );

  return {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    scrollDayToStart,
    dragHandlers,
    shouldSuppressClick,
    renderEdgeZones: () => (
      <>
        {renderEdgeZone("left", canScrollLeft)}
        {renderEdgeZone("right", canScrollRight)}
      </>
    ),
  };
}
