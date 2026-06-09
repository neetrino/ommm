import type { CSSProperties } from "react";

/** Member hub bottom sheet height — slightly above half the visible mobile viewport. */
export const MEMBER_ACCOUNT_HUB_SHEET_VIEWPORT_HEIGHT = "80dvh";

export const MEMBER_ACCOUNT_HUB_SHEET_PANEL_CLASS = "ommm-member-hub-sheet-panel";

export const MEMBER_ACCOUNT_HUB_SHEET_OVERLAY_CLASS = "ommm-member-hub-sheet-overlay";

/** Inline height — reliable on mobile Safari where CSS-only rules may not apply. */
export function memberAccountHubSheetPanelStyle(): CSSProperties {
  return {
    height: MEMBER_ACCOUNT_HUB_SHEET_VIEWPORT_HEIGHT,
    maxHeight: MEMBER_ACCOUNT_HUB_SHEET_VIEWPORT_HEIGHT,
    minHeight: MEMBER_ACCOUNT_HUB_SHEET_VIEWPORT_HEIGHT,
  };
}

export const MEMBER_ACCOUNT_HUB_SHEET_GRABBER_CLASS =
  "mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-sage-300/80";

export const MEMBER_ACCOUNT_HUB_SHEET_HEADER_CLASS =
  "flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-1";

export const MEMBER_ACCOUNT_HUB_SHEET_BODY_CLASS =
  "min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]";

export const MEMBER_ACCOUNT_HUB_SHEET_TITLE_CLASS = "ommm-admin-header-title min-w-0";

/** Desktop notifications panel — liquid glass column on the right. */
export const MEMBER_NOTIFICATIONS_DESKTOP_OVERLAY_CLASS =
  "ommm-member-notifications-desktop-overlay";

export const MEMBER_NOTIFICATIONS_DESKTOP_BACKDROP_CLASS =
  "ommm-member-notifications-desktop-backdrop";

export const MEMBER_NOTIFICATIONS_DESKTOP_PANEL_CLASS =
  "ommm-member-notifications-desktop-panel";

export const MEMBER_NOTIFICATIONS_DESKTOP_HEADER_CLASS =
  "flex shrink-0 items-center justify-between gap-3 px-5 py-4";

export const MEMBER_NOTIFICATIONS_DESKTOP_BODY_CLASS =
  "min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-5";

/** Desktop notifications enter/exit — keep in sync with CSS transitions. */
export const MEMBER_NOTIFICATIONS_DESKTOP_MOTION_MS = 440;
