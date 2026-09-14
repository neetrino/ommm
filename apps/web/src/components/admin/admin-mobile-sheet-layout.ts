import type { CSSProperties } from "react";

/** Admin mobile bottom sheet height — matches Ilona portal forms (~94dvh). */
export const ADMIN_MOBILE_SHEET_VIEWPORT_HEIGHT = "94dvh";

/** Keep in sync with CSS transitions on the mobile sheet panel. */
export const ADMIN_MOBILE_SHEET_MOTION_MS = 480;

/** Pull-down distance that commits a swipe-to-close. */
export const ADMIN_MOBILE_SHEET_DRAG_CLOSE_DISTANCE_PX = 96;

/** Ignore tiny grabber taps so content does not dismiss by accident. */
export const ADMIN_MOBILE_SHEET_DRAG_START_THRESHOLD_PX = 8;

/** Fast flick downward also closes, even before the distance threshold. */
export const ADMIN_MOBILE_SHEET_DRAG_VELOCITY_PX_PER_MS = 0.55;

export function shouldCloseFromSheetDrag(deltaY: number, elapsedMs: number): boolean {
  if (deltaY < ADMIN_MOBILE_SHEET_DRAG_START_THRESHOLD_PX) {
    return false;
  }
  if (deltaY >= ADMIN_MOBILE_SHEET_DRAG_CLOSE_DISTANCE_PX) {
    return true;
  }
  return deltaY / Math.max(1, elapsedMs) >= ADMIN_MOBILE_SHEET_DRAG_VELOCITY_PX_PER_MS;
}

export const ADMIN_MOBILE_SHEET_OVERLAY_CLASS = "ommm-admin-mobile-sheet-overlay";

export const ADMIN_MOBILE_SHEET_PANEL_CLASS = "ommm-admin-mobile-sheet-panel";

export const ADMIN_MOBILE_SHEET_GRABBER_CLASS =
  "mx-auto h-1.5 w-12 shrink-0 rounded-full bg-sage-500";

/** Drag handle row — small centered line, large touch target. */
export const ADMIN_MOBILE_SHEET_GRABBER_ROW_CLASS =
  "flex min-h-10 shrink-0 cursor-grab touch-none items-center justify-center px-5 py-2 active:cursor-grabbing";

/** Inline height — reliable on mobile Safari. */
export function adminMobileSheetPanelStyle(): CSSProperties {
  return {
    height: ADMIN_MOBILE_SHEET_VIEWPORT_HEIGHT,
    maxHeight: ADMIN_MOBILE_SHEET_VIEWPORT_HEIGHT,
    minHeight: ADMIN_MOBILE_SHEET_VIEWPORT_HEIGHT,
  };
}

/** Shared admin modal panel — bottom sheet on phone, centered card on tablet+. */
export const ADMIN_MODAL_PANEL_SHELL_CLASS = [
  "relative z-10 flex w-full flex-col overflow-hidden",
  "max-h-[94dvh] rounded-t-[28px] border border-white/70 border-b-0",
  "bg-white/95 shadow-[0_-16px_48px_-20px_rgba(45,40,35,0.38)] backdrop-blur-md",
  "sm:mt-0 sm:max-h-[90vh] sm:rounded-[28px] sm:border-b sm:shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)]",
].join(" ");

export const ADMIN_CONFIRM_MODAL_PANEL_CLASS = [
  ADMIN_MODAL_PANEL_SHELL_CLASS,
  "max-w-md sm:max-w-md",
  "p-6",
].join(" ");

/** Centered confirm card on all breakpoints (no phone bottom-sheet chrome). */
export const ADMIN_CONFIRM_CENTERED_MODAL_PANEL_CLASS = [
  "relative z-10 flex w-full max-w-md flex-col overflow-hidden",
  "max-h-[90vh] rounded-[28px] border border-white/70",
  "bg-white/95 p-6 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)] backdrop-blur-md",
].join(" ");

/** Wide admin create/edit forms — bottom sheet on phone, centered modal on tablet+. */
export function adminFormModalPanelClass(maxWidthClass: string): string {
  return [ADMIN_MODAL_PANEL_SHELL_CLASS, maxWidthClass].join(" ");
}
