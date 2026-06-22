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

/** Decelerates into the apex — near-zero speed before the drop. */
const RISE_EASING = "cubic-bezier(0.12, 0.84, 0.22, 1)";
const SQUASH_EASING = "linear";
/** Quadratic fall samples — constant acceleration, no velocity jump after the apex. */
const FALL_MOTION_SAMPLES = [
  { timeRatio: 0, distanceRatio: 0 },
  { timeRatio: 0.12, distanceRatio: 0, easing: "linear" as const },
  { timeRatio: 0.32, distanceRatio: 0.035, easing: "cubic-bezier(0.14, 0, 0.48, 0.92)" as const },
  { timeRatio: 0.52, distanceRatio: 0.14, easing: "linear" as const },
  { timeRatio: 0.72, distanceRatio: 0.36, easing: "linear" as const },
  { timeRatio: 0.88, distanceRatio: 0.64, easing: "linear" as const },
  { timeRatio: 1, distanceRatio: 1, easing: "linear" as const },
] as const;

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

function randomPeakPx(basePx: number, boostMinPx: number, boostMaxPx: number): number {
  const boostPx = boostMinPx + Math.random() * (boostMaxPx - boostMinPx);
  return Math.round(basePx + boostPx);
}

function buildFallKeyframes(
  x: number,
  startY: number,
  groundY: number,
  fallEnd: number,
): Keyframe[] {
  const fallDrop = groundY - startY;

  return FALL_MOTION_SAMPLES.map((sample) => ({
    transform: ballTransform(x, startY + fallDrop * sample.distanceRatio, 1, 1),
    offset: fallEnd * sample.timeRatio,
    ...(sample.easing ? { easing: sample.easing } : {}),
  }));
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
      peakBasePx,
      peakBoostMinPx,
      peakBoostMaxPx,
      fallMs,
      squashMs,
      impactHoldMs,
      riseMs,
      driftPx,
      groundReachPx,
      squashScaleX,
      squashScaleY,
      riseStretchScaleX,
      riseStretchScaleY,
    } = HOME_FOOTER_SPHERE_BOUNCE;

    const totalMs = fallMs + squashMs + impactHoldMs + riseMs;
    const fallEnd = fallMs / totalMs;
    const squashEnd = (fallMs + squashMs) / totalMs;
    const impactEnd = (fallMs + squashMs + impactHoldMs) / totalMs;
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
      const cyclePeakPx = randomPeakPx(peakBasePx, peakBoostMinPx, peakBoostMaxPx);

      activeAnim = el.animate(
        [
          ...buildFallKeyframes(x, startY, groundY, fallEnd),
          {
            transform: ballTransform(x, groundY, squashScaleX, squashScaleY),
            offset: squashEnd,
            easing: SQUASH_EASING,
          },
          {
            transform: ballTransform(x, groundY, squashScaleX, squashScaleY),
            offset: impactEnd,
          },
          {
            transform: ballTransform(
              endX,
              -cyclePeakPx * 0.38,
              riseStretchScaleX,
              riseStretchScaleY,
            ),
            offset: riseLaunch,
            easing: RISE_EASING,
          },
          { transform: ballTransform(endX, -cyclePeakPx, 1, 1), easing: RISE_EASING },
        ],
        { duration: totalMs, fill: "forwards" },
      );

      activeAnim.onfinish = () => {
        x = endX;
        startY = -cyclePeakPx;
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
