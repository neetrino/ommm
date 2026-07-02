import { space } from "../../../../theme/tokens";

/** Blur without heavy milkiness — pair with low `backgroundColor` for clear glass. */
export const NEXT_CLASS_DETAILS_BLUR_INTENSITY = 14;

/**
 * Draw frosted details further onto the hero image without changing layout
 * (siblings keep their positions) or shrinking inner padding.
 */
export const NEXT_CLASS_DETAILS_OVER_IMAGE =
  space.xxl + space.md + space.sm + space.xs;

/**
 * Extra top padding only — draws the frosted panel onto the hero; bottom stays
 * tighter so overall height trims from below.
 */
export const NEXT_CLASS_DETAILS_EXTRA_VERTICAL_TOP = space.md;

/** Horizontal inset of frosted panel inside the card; lower = slightly wider glass. */
export const NEXT_CLASS_DETAILS_SIDE_INSET = 0;

/** Tight specular highlights only (no full-panel white wash) — reads shiny + transparent. */
export const NEXT_CLASS_GLASS_BASE_TINT = "rgba(255,255,255,0.02)" as const;
export const NEXT_CLASS_GLASS_SHEEN_PEAK = "rgba(255,255,255,0.72)" as const;
export const NEXT_CLASS_GLASS_SHEEN_MID = "rgba(255,255,255,0.14)" as const;
export const NEXT_CLASS_GLASS_SHEEN_FLOOR = "rgba(255,255,255,0.015)" as const;
export const NEXT_CLASS_GLASS_TOP_GLOW = "rgba(255,255,255,0.26)" as const;
export const NEXT_CLASS_GLASS_TOP_GLOW_MID = "rgba(255,255,255,0.05)" as const;
export const NEXT_CLASS_GLASS_DIAG_GLEAM = "rgba(255,255,255,0.26)" as const;
export const NEXT_CLASS_GLASS_DIAG_GLEAM_MID = "rgba(255,255,255,0.05)" as const;
export const NEXT_CLASS_GLASS_HOT_SPOT = "rgba(255,255,255,0.4)" as const;
export const NEXT_CLASS_GLASS_CORNER_FLARE = "rgba(255,255,255,0.17)" as const;
export const NEXT_CLASS_GLASS_CORNER_FLARE_SOFT = "rgba(255,255,255,0.03)" as const;
export const NEXT_CLASS_GLASS_TOP_EDGE_FLARE = "rgba(255,255,255,0.82)" as const;
export const NEXT_CLASS_GLASS_RIM = "rgba(255,255,255,0.56)" as const;
