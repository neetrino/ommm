import { CANVAS_TABLET_MIN_WIDTH_PX } from "@/lib/viewport-breakpoints";

export const HOVER_MENU_CLOSE_DELAY_MS = 180;
export const HOVER_MENU_ANIMATION_MS = 220;
/** Mobile dismiss transform duration — keep in sync with `.ommm-dropdown-menu--mobile-dismiss` in CSS. */
export const HOVER_OPEN_MEDIA_QUERY = "(hover: hover) and (pointer: fine)";
export const MOBILE_VIEWPORT_MEDIA_QUERY = `(max-width: ${CANVAS_TABLET_MIN_WIDTH_PX - 1}px)`;
export const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";
