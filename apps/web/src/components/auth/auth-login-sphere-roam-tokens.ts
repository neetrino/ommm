/** Slow omnidirectional roam across the full login viewport — spheres may overlap. */
export const AUTH_LOGIN_SPHERE_ROAM = {
  edgePaddingPx: 8,
  /** Lower = slower travel across the page. */
  speedPxPerMs: 0.026,
  targetArrivePx: 6,
  /** Cursor-to-sphere-center distance that starts a flee reaction. */
  pointerFleeRadiusPx: 132,
  /** Peak flee speed when the cursor is on the sphere center. */
  pointerFleeSpeedPxPerMs: 0.42,
} as const;
