/** Figma desktop artboard width — canvas scaler design width. */
export const CANVAS_DESIGN_WIDTH_PX = 1440;

/** Below this width: real mobile layout (no canvas scaling). */
export const CANVAS_TABLET_MIN_WIDTH_PX = 744;

/** Full-size inline marketing nav — above largest iPad Pro landscape (1366px). */
export const NAV_DESKTOP_MIN_WIDTH_PX = 1367;

/** Native 1:1 content — no scale above 1. */
export const CONTENT_DESKTOP_MIN_WIDTH_PX = 1440;

/** App shells: sidebar dock vs drawer (unchanged from Tailwind default). */
export const APP_SIDEBAR_MIN_WIDTH_PX = 1024;

/** iPad Pro / tablet tier — compact nav between lg and nav-desktop. */
export const NAV_TABLET_COMPACT_MIN_WIDTH_PX = APP_SIDEBAR_MIN_WIDTH_PX;

/** Home sections below hero — canvas scale from this width (iPad uses native full-width layout). */
export const HOME_CANVAS_SCALE_MIN_WIDTH_PX = APP_SIDEBAR_MIN_WIDTH_PX;

/** Minimum effective touch target (px) when UI is canvas-scaled. */
export const MIN_TOUCH_TARGET_PX = 44;
