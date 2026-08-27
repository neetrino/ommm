"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

export type ScrollAnchorSide = "left" | "right";

/** True when `target` intersects the horizontal scroll viewport of `container`. */
export function isHorizontallyInView(
  container: HTMLElement,
  target: HTMLElement,
): boolean {
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  return (
    targetRect.right > containerRect.left + 2 &&
    targetRect.left < containerRect.right - 2
  );
}

/** Which side of the viewport the target sits on when it is fully off-screen. */
export function resolveOffscreenAnchorSide(
  container: HTMLElement,
  target: HTMLElement,
): ScrollAnchorSide | null {
  if (isHorizontallyInView(container, target)) {
    return null;
  }
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  return targetRect.right <= containerRect.left + 2 ? "left" : "right";
}

type UseScrollAnchorInViewOptions = {
  containerRef: RefObject<HTMLElement | null>;
  /** Resolves the anchored element inside the scroll container (e.g. today’s card). */
  resolveTarget: () => HTMLElement | null;
  dependencyKey?: string;
};

/**
 * Tracks whether an anchored child is visible in a horizontal scroller.
 * Used for “jump to today” chrome that only appears when today is off-screen.
 */
export function useScrollAnchorInView({
  containerRef,
  resolveTarget,
  dependencyKey = "",
}: UseScrollAnchorInViewOptions): {
  isAnchorInView: boolean;
  /** Side where the anchor sits when off-screen; `null` when in view or unknown. */
  anchorSide: ScrollAnchorSide | null;
  scrollAnchorIntoView: () => void;
} {
  const [isAnchorInView, setIsAnchorInView] = useState(true);
  const [anchorSide, setAnchorSide] = useState<ScrollAnchorSide | null>(null);

  const update = useCallback(() => {
    const container = containerRef.current;
    const target = resolveTarget();
    if (!container || !target) {
      setIsAnchorInView(true);
      setAnchorSide(null);
      return;
    }
    const side = resolveOffscreenAnchorSide(container, target);
    setIsAnchorInView(side === null);
    setAnchorSide(side);
  }, [containerRef, resolveTarget]);

  const scrollAnchorIntoView = useCallback(() => {
    const container = containerRef.current;
    const target = resolveTarget();
    if (!container || !target) {
      return;
    }
    const containerLeft = container.getBoundingClientRect().left;
    const targetLeft = target.getBoundingClientRect().left;
    container.scrollLeft += targetLeft - containerLeft;
    update();
  }, [containerRef, resolveTarget, update]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }
    update();
    container.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => {
      container.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [containerRef, dependencyKey, update]);

  return { isAnchorInView, anchorSide, scrollAnchorIntoView };
}
