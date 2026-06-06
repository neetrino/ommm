"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  SCHEDULE_WEEK_EDGE_ZONE_WIDTH_PX,
  SCHEDULE_WEEK_SCROLL_SPEED_PX,
} from "@/components/shared/schedule/schedule-week-view-tokens";

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
};

export function useScheduleWeekBoardScroll(
  dependencyKey: string | number,
): UseScheduleWeekBoardScrollResult {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const autoScrollDir = useRef<"left" | "right" | null>(null);
  const rafId = useRef<number>(0);

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    setCanScrollLeft(element.scrollLeft > 2);
    setCanScrollRight(element.scrollLeft < element.scrollWidth - element.clientWidth - 2);
  }, []);

  const startAutoScroll = useCallback((direction: "left" | "right") => {
    autoScrollDir.current = direction;
    const tick = () => {
      const element = scrollRef.current;
      if (!element || !autoScrollDir.current) return;
      element.scrollLeft +=
        autoScrollDir.current === "left"
          ? -SCHEDULE_WEEK_SCROLL_SPEED_PX
          : SCHEDULE_WEEK_SCROLL_SPEED_PX;
      rafId.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(tick);
  }, []);

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
      className={`absolute top-0 z-20 flex h-full items-center transition-opacity duration-200 ${
        side === "left"
          ? "left-0 bg-gradient-to-r from-paper/90"
          : "right-0 bg-gradient-to-l from-paper/90"
      } to-transparent ${canScroll ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      style={{ width: SCHEDULE_WEEK_EDGE_ZONE_WIDTH_PX }}
    >
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-white/80 shadow-sm backdrop-blur-sm">
          <ScheduleWeekScrollChevron direction={side} />
        </div>
      </div>
    </div>
  );

  return {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    renderEdgeZones: () => (
      <>
        {renderEdgeZone("left", canScrollLeft)}
        {renderEdgeZone("right", canScrollRight)}
      </>
    ),
  };
}
