/** Slow omnidirectional roam with sphere-to-sphere separation on the login page. */
export const AUTH_LOGIN_SPHERE_ROAM = {
  edgePaddingPx: 8,
  minLegDurationMs: 14_000,
  maxLegDurationMs: 32_000,
  /** Lower = slower travel across the page. */
  speedPxPerMs: 0.026,
  legEasing: "cubic-bezier(0.42, 0, 0.18, 1)",
  /** Minimum gap between sphere edges while roaming. */
  separationGapPx: 24,
  /** Repulsion solver passes per animation frame. */
  repulsionIterations: 4,
  targetPickAttempts: 16,
  targetArrivePx: 6,
} as const;
