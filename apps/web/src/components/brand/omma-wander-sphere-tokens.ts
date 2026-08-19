import { HOME_FOOTER_FIGMA } from "@/components/marketing/home/home-footer-section-tokens";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";

/** Same glossy “O” ball as the footer bounce and login roam. */
export const OMMA_WANDER_SPHERE_ASSET = HOME_SECTION_ASSETS.footerIllustration;

export const OMMA_WANDER_SIZE_FOOTER_PX = Math.round(
  HOME_FOOTER_FIGMA.illustrationSizePx * HOME_FOOTER_FIGMA.illustrationDisplayScale,
);
export const OMMA_WANDER_SIZE_VS_FOOTER = 0.56;
export const OMMA_WANDER_SIZE_MOBILE_RATIO = 0.72;
export const OMMA_WANDER_SIZE_DESKTOP_PX = Math.round(
  OMMA_WANDER_SIZE_FOOTER_PX * OMMA_WANDER_SIZE_VS_FOOTER,
);
export const OMMA_WANDER_SIZE_MOBILE_PX = Math.round(
  OMMA_WANDER_SIZE_DESKTOP_PX * OMMA_WANDER_SIZE_MOBILE_RATIO,
);
export const OMMA_WANDER_MOBILE_MAX_WIDTH_PX = 743;

/** Visible sphere vs PNG frame — collision circle sits inside the graphic. */
export const OMMA_WANDER_RADIUS_RATIO = 0.44;
export const OMMA_WANDER_SIZE_SMALL_CHANCE = 0.12;
export const OMMA_WANDER_SIZE_MEDIUM_CHANCE = 0.22;
export const OMMA_WANDER_SIZE_SMALL_MIN = 0.55;
export const OMMA_WANDER_SIZE_SMALL_MAX = 0.74;
export const OMMA_WANDER_SIZE_MEDIUM_MIN = 0.88;
export const OMMA_WANDER_SIZE_MEDIUM_MAX = 1.08;
export const OMMA_WANDER_SIZE_LARGE_MIN = 1.2;
export const OMMA_WANDER_SIZE_LARGE_MAX = 1.62;

export const OMMA_WANDER_FIRST_DELAY_MS = 2 * 60 * 1000;
export const OMMA_WANDER_FIRST_JITTER_MS = 20 * 1000;
export const OMMA_WANDER_GAP_MIN_MS = 2 * 60 * 1000;
export const OMMA_WANDER_GAP_MAX_MS = 30 * 60 * 1000;
export const OMMA_WANDER_BURST_COUNT_MIN = 2;
export const OMMA_WANDER_BURST_COUNT_MAX = 3;
export const OMMA_WANDER_STAGGER_MS = 2_000;

export const OMMA_WANDER_DEMO_FIRST_MS = 4_000;
export const OMMA_WANDER_DEMO_GAP_MS = 22_000;
export const OMMA_WANDER_HIDDEN_RETRY_MS = 8_000;
export const OMMA_WANDER_DUE_SOON_MS = 900;

export const OMMA_WANDER_SESSION_NEXT_AT_KEY = "omma-wander-next-at";
export const OMMA_WANDER_QUERY_KEY = "ommaWander";

export const OMMA_WANDER_GRAVITY_PX_S2 = 1_260;
export const OMMA_WANDER_DRAG = 0.16;
export const OMMA_WANDER_MAX_SPEED_PX_S = 1_160;
export const OMMA_WANDER_RESTITUTION = 0.72;
export const OMMA_WANDER_RESTITUTION_JITTER = 0.04;
export const OMMA_WANDER_TANGENT_KEEP = 0.82;
export const OMMA_WANDER_SQUASH_RECOVER = 3.4;
export const OMMA_WANDER_SQUASH_X_GAIN = 0.065;
export const OMMA_WANDER_SQUASH_Y_GAIN = 0.115;
export const OMMA_WANDER_SQUASH_SIDE_GAIN = 0.04;
export const OMMA_WANDER_IMPACT_REF_PX_S = 820;
export const OMMA_WANDER_LEAVE_RESTITUTION_SCALE = 0.42;
export const OMMA_WANDER_LEAVE_FLOOR_KICK_PX_S = 180;
export const OMMA_WANDER_FLOOR_DEPTH_PX = 400;
export const OMMA_WANDER_OFFSCREEN_MARGIN_RATIO = 2.4;
export const OMMA_WANDER_OFFSCREEN_TOP_RATIO = 0.45;
export const OMMA_WANDER_ROLL_DEG_PER_PX = 0.1;
export const OMMA_WANDER_ROLL_SPEED_PX_S = 80;
export const OMMA_WANDER_SUPPORT_NORMAL_MAX = -0.55;
export const OMMA_WANDER_HOP_VY_MIN = 300;
export const OMMA_WANDER_HOP_VY_MAX = 500;
export const OMMA_WANDER_HOP_VX_MIN = 140;
export const OMMA_WANDER_HOP_VX_MAX = 260;
export const OMMA_WANDER_AIM_STEER_PX_S = 240;

export const OMMA_WANDER_EXIT_AFTER_BOUNCES = 8;
export const OMMA_WANDER_EXIT_AFTER_MS = 7_200;
export const OMMA_WANDER_MAX_LIFE_MS = 9_000;
export const OMMA_WANDER_EXIT_SPEED_PX_S = 420;
export const OMMA_WANDER_SUBSTEP_MAX_SEC = 0.018;
export const OMMA_WANDER_DT_CLAMP_SEC = 0.034;
export const OMMA_WANDER_SURFACE_REFRESH_MS = 180;
export const OMMA_WANDER_MAX_SURFACES = 32;
export const OMMA_WANDER_MIN_SURFACE_WIDTH_PX = 56;
export const OMMA_WANDER_MIN_SURFACE_HEIGHT_PX = 26;
export const OMMA_WANDER_MAX_SURFACE_VIEWPORT_AREA = 0.32;
export const OMMA_WANDER_SURFACE_VIEWPORT_PAD_PX = 48;
export const OMMA_WANDER_HEADER_CLEAR_PX = 128;
export const OMMA_WANDER_HEADER_WIDE_RATIO = 0.55;
export const OMMA_WANDER_SLAB_WIDTH_RATIO = 0.62;
export const OMMA_WANDER_SLAB_HEIGHT_RATIO = 0.18;

export const OMMA_WANDER_SPAWN_INSET_RATIO = 0.12;
export const OMMA_WANDER_SIDE_SPAWN_TOP_RATIO = 0.2;
export const OMMA_WANDER_SIDE_SPAWN_BOTTOM_RATIO = 0.58;
export const OMMA_WANDER_SPAWN_VX_MIN = 120;
export const OMMA_WANDER_SPAWN_VX_MAX = 240;
export const OMMA_WANDER_SPAWN_VY_MIN = 36;
export const OMMA_WANDER_SPAWN_VY_MAX = 96;
export const OMMA_WANDER_TOP_VX_SPREAD = 200;
export const OMMA_WANDER_CORNER_VX_SCALE = 0.72;
export const OMMA_WANDER_AIM_PULL = 0.22;
