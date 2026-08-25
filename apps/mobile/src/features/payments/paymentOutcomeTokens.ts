/** Mirrors web `PAYMENT_OUTCOME_SPHERE_SIZE` (half of footer mobile illustration). */
export const PAYMENT_OUTCOME_SPHERE = {
  widthPx: 200,
  heightPx: 198,
} as const;

/**
 * Mirrors web `PAYMENT_OUTCOME_SPHERE_BOUNCE`
 * (footer desktop bounce × 0.5, stage-clamped drop).
 */
export const PAYMENT_OUTCOME_SPHERE_BOUNCE = {
  /** Scaled desktop peak ≈ 129 → 65. */
  peakBasePx: 65,
  peakBoostMinPx: 50,
  peakBoostMaxPx: 150,
  fallMs: 900,
  squashMs: 120,
  impactHoldMs: 70,
  riseMs: 780,
  driftPx: 29,
  driftMaxPx: 84,
  maxDropPx: 52,
  groundReachPx: 14,
  squashScaleX: 1.065,
  squashScaleY: 0.885,
  riseStretchScaleX: 0.985,
  riseStretchScaleY: 1.042,
} as const;

export const PAYMENT_OUTCOME_ICON_RING = {
  sizePx: 76,
  glyphSizePx: 36,
  success: {
    border: "rgba(167, 243, 208, 0.85)",
    gradient: ["rgba(236, 253, 245, 0.98)", "rgba(209, 250, 229, 0.88)"] as const,
    icon: "#065f46",
    shadow: "rgb(16, 185, 129)",
  },
  failed: {
    border: "rgba(254, 202, 202, 0.9)",
    gradient: ["rgba(254, 242, 242, 0.98)", "rgba(254, 226, 226, 0.9)"] as const,
    icon: "#991b1b",
    shadow: "rgb(239, 68, 68)",
  },
  pending: {
    border: "rgba(253, 230, 138, 0.9)",
    gradient: ["rgba(255, 251, 235, 0.98)", "rgba(254, 243, 199, 0.9)"] as const,
    icon: "#92400e",
    shadow: "rgb(245, 158, 11)",
  },
} as const;

export const PAYMENT_OUTCOME_PANEL_GRADIENT = [
  "rgba(255, 255, 255, 0.98)",
  "rgba(250, 248, 244, 0.96)",
  "rgba(245, 242, 236, 0.94)",
] as const;
