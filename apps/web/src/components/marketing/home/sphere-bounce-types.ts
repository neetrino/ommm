export type SphereBounceConfig = {
  minWidthPx: number;
  /** When set, bounce runs only up to this viewport width (mobile-only loops). */
  maxWidthPx?: number;
  peakBasePx: number;
  peakBoostMinPx: number;
  peakBoostMaxPx: number;
  fallMs: number;
  squashMs: number;
  impactHoldMs: number;
  riseMs: number;
  driftPx: number;
  groundReachPx: number;
  driftMaxPx: number;
  squashScaleX: number;
  squashScaleY: number;
  riseStretchScaleX: number;
  riseStretchScaleY: number;
  maxDropPx?: number;
};

export type MeasureSphereGroundY = (
  el: HTMLElement,
  logicalY: number,
  reachPx: number,
) => number;
