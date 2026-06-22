"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
  HOME_FOOTER_SPHERE_BOUNCE,
} from "@/components/marketing/home/home-footer-section-tokens";

type HomeFooterSphereBounceProps = {
  className?: string;
  children: ReactNode;
};

const FALL_EASING = "cubic-bezier(0.55, 0.05, 0.95, 0.45)";
const RISE_EASING = "cubic-bezier(0.25, 0.68, 0.32, 1)";
const IMPACT_EASING = "cubic-bezier(0.4, 0, 0.95, 0.55)";

function isBounceViewport(): boolean {
  return window.matchMedia(`(min-width: ${HOME_FOOTER_SPHERE_BOUNCE.minWidthPx}px)`).matches;
}

function ballTransform(x: number, y: number, scaleX: number, scaleY: number): string {
  return `translate3d(${x}px, ${y}px, 0) scale(${scaleX}, ${scaleY})`;
}

/**
 * Fall distance from rest (logicalY = 0) to the site floor.
 * Floor = bottom of the footer section or viewport — whichever is higher — plus optical reach.
 */
function measureGroundY(el: HTMLElement, logicalY: number, reachPx: number): number {
  const rect = el.getBoundingClientRect();
  const restBottom = rect.bottom - logicalY;
  const viewportFloor = window.innerHeight;
  const section = el.closest("section");
  const sectionFloor = section?.getBoundingClientRect().bottom ?? viewportFloor;
  const floor = Math.min(viewportFloor, sectionFloor);

  return Math.max(0, floor - restBottom + reachPx);
}

function nextDriftX(currentX: number, driftPx: number): number {
  const delta = (Math.random() * 2 - 1) * driftPx;
  const limit = driftPx * 2.5;
  return Math.max(-limit, Math.min(limit, currentX + delta));
}

/**
 * Desktop footer sphere — falls to the site edge, squashes on impact, bounces up and drifts.
 */
export function HomeFooterSphereBounce({ className, children }: HomeFooterSphereBounceProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion || !isBounceViewport()) {
      return;
    }

    const {
      peakPx,
      fallMs,
      riseMs,
      impactMs,
      driftPx,
      groundReachPx,
      squashScaleX,
      squashScaleY,
      fallStretchScaleX,
      fallStretchScaleY,
      riseStretchScaleX,
      riseStretchScaleY,
    } = HOME_FOOTER_SPHERE_BOUNCE;

    const totalMs = fallMs + impactMs + riseMs;
    const fallEnd = fallMs / totalMs;
    const impactEnd = (fallMs + impactMs) / totalMs;
    const riseLaunch = impactEnd + (1 - impactEnd) * 0.28;

    let x = 0;
    let startY = 0;
    let cancelled = false;
    let activeAnim: Animation | null = null;
    const desktopMq = window.matchMedia(`(min-width: ${HOME_FOOTER_SPHERE_BOUNCE.minWidthPx}px)`);

    const runCycle = () => {
      if (cancelled) {
        return;
      }

      const groundY = measureGroundY(el, startY, groundReachPx);
      const endX = nextDriftX(x, driftPx);
      const fallStretchY = Math.max(startY, groundY - Math.max(12, (groundY - startY) * 0.08));

      activeAnim = el.animate(
        [
          { transform: ballTransform(x, startY, 1, 1) },
          {
            transform: ballTransform(
              x,
              fallStretchY,
              fallStretchScaleX,
              fallStretchScaleY,
            ),
            offset: fallEnd * 0.9,
            easing: FALL_EASING,
          },
          {
            transform: ballTransform(x, groundY, squashScaleX, squashScaleY),
            offset: fallEnd,
            easing: IMPACT_EASING,
          },
          {
            transform: ballTransform(x, groundY, squashScaleX, squashScaleY),
            offset: impactEnd,
          },
          {
            transform: ballTransform(
              endX,
              -peakPx * 0.38,
              riseStretchScaleX,
              riseStretchScaleY,
            ),
            offset: riseLaunch,
            easing: RISE_EASING,
          },
          { transform: ballTransform(endX, -peakPx, 1, 1), easing: RISE_EASING },
        ],
        { duration: totalMs, fill: "forwards" },
      );

      activeAnim.onfinish = () => {
        x = endX;
        startY = -peakPx;
        runCycle();
      };
    };

    const onViewportChange = () => {
      if (!desktopMq.matches) {
        cancelled = true;
        activeAnim?.cancel();
        el.style.transform = "";
        return;
      }

      activeAnim?.cancel();
      startY = 0;
      x = 0;
      cancelled = false;
      runCycle();
    };

    runCycle();

    desktopMq.addEventListener("change", onViewportChange);
    window.addEventListener("resize", onViewportChange);

    return () => {
      cancelled = true;
      activeAnim?.cancel();
      el.style.transform = "";
      desktopMq.removeEventListener("change", onViewportChange);
      window.removeEventListener("resize", onViewportChange);
    };
  }, [reducedMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
