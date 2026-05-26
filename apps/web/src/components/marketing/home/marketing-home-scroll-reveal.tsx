"use client";

import {
  type MutableRefObject,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/** Intersection ratio before triggering reveal (single threshold, no per-frame work). */
const INTERSECTION_THRESHOLD = 0.12;

/** Earlier trigger so the full choreographed motion reads on screen. */
const INTERSECTION_ROOT_MARGIN = "0px 0px -18% 0px";

/** Light arrives first; keeps the entrance editorial, not “bouncy”. */
const REVEAL_OPACITY_MS = 640;

/** Long, soft landing on position + scale (premium pacing, still one IO). */
const REVEAL_TRANSFORM_MS = 1180;

/** Transform follows opacity slightly — layered luxury staging. */
const REVEAL_TRANSFORM_DELAY_MS = 90;

/** Confident early lift, then eases into full clarity. */
const REVEAL_EASE_OPACITY = "cubic-bezier(0.26, 0.9, 0.32, 1)";

/** Long deceleration tail — calm, expensive-feeling settle. */
const REVEAL_EASE_TRANSFORM = "cubic-bezier(0.12, 0.72, 0.12, 1)";

function readPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isElementInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  return rect.top < vh && rect.bottom > 0 && rect.left < vw && rect.right > 0;
}

function attachRevealObserver(
  el: HTMLElement,
  onIntersect: () => void,
  observerRef: MutableRefObject<IntersectionObserver | null>,
): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting) {
        onIntersect();
      }
    },
    {
      root: null,
      rootMargin: INTERSECTION_ROOT_MARGIN,
      threshold: INTERSECTION_THRESHOLD,
    },
  );

  observer.observe(el);
  observerRef.current = observer;

  return () => {
    observer.disconnect();
    observerRef.current = null;
  };
}

function useMarketingHomeReveal() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [revealed, setRevealed] = useState<boolean | null>(null);
  const [motionAllowed, setMotionAllowed] = useState(true);

  const finishReveal = useCallback(() => {
    setRevealed(true);
    observerRef.current?.disconnect();
    observerRef.current = null;
  }, []);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) {
      return;
    }

    /* Layout-driven visibility gate: measure viewport once, then set reveal state before paint (no scroll listeners). */
    /* eslint-disable react-hooks/set-state-in-effect -- synchronous layout + IO registration; not a data-fetch effect */
    if (readPrefersReducedMotion()) {
      setMotionAllowed(false);
      setRevealed(true);
      return;
    }

    if (isElementInViewport(el)) {
      setRevealed(true);
      return;
    }

    setRevealed(false);
    /* eslint-enable react-hooks/set-state-in-effect */

    return attachRevealObserver(el, finishReveal, observerRef);
  }, [finishReveal]);

  const isHidden = revealed === false;
  const useTransition = motionAllowed && (isHidden || revealed === true);

  return {
    rootRef,
    isHidden,
    motionClass: isHidden
      ? "pointer-events-none translate-y-10 scale-[0.958] opacity-0 transform-gpu"
      : "pointer-events-auto translate-y-0 scale-100 opacity-100 transform-gpu",
    transitionStyle: useTransition
      ? {
          transitionProperty: "opacity, transform",
          transitionDuration: `${REVEAL_OPACITY_MS}ms, ${REVEAL_TRANSFORM_MS}ms`,
          transitionTimingFunction: `${REVEAL_EASE_OPACITY}, ${REVEAL_EASE_TRANSFORM}`,
          transitionDelay: `0ms, ${REVEAL_TRANSFORM_DELAY_MS}ms`,
        }
      : undefined,
    willChange: isHidden ? ("opacity, transform" as const) : ("auto" as const),
  };
}

export type MarketingHomeScrollRevealProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Viewport reveal for marketing home: staged opacity, delayed transform, long luxe ease-out.
 * Uses `IntersectionObserver` (no scroll listeners), runs once per mount, respects reduced motion.
 */
export function MarketingHomeScrollReveal({
  children,
  className = "",
}: MarketingHomeScrollRevealProps) {
  const { rootRef, motionClass, transitionStyle, willChange } = useMarketingHomeReveal();

  return (
    <div ref={rootRef} className={`min-h-0 w-full ${className}`.trim()}>
      <div
        className={motionClass}
        style={{
          ...transitionStyle,
          willChange,
        }}
      >
        {children}
      </div>
    </div>
  );
}
