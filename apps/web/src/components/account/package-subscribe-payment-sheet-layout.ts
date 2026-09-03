/** Desktop subscribe drawer — liquid glass panel sliding in from the right (half viewport). */
export const PACKAGE_SUBSCRIBE_DESKTOP_OVERLAY_CLASS =
  "ommm-package-subscribe-desktop-overlay";

export const PACKAGE_SUBSCRIBE_DESKTOP_BACKDROP_CLASS =
  "ommm-package-subscribe-desktop-backdrop";

export const PACKAGE_SUBSCRIBE_DESKTOP_PANEL_CLASS = "ommm-package-subscribe-desktop-panel";

export const PACKAGE_SUBSCRIBE_MOBILE_OVERLAY_CLASS = "ommm-package-subscribe-mobile-overlay";

export const PACKAGE_SUBSCRIBE_MOBILE_PANEL_CLASS = "ommm-package-subscribe-mobile-panel";

export const PACKAGE_SUBSCRIBE_DESKTOP_HEADER_CLASS =
  "flex shrink-0 items-start justify-between gap-3 px-5 py-4";

/** Shared sheet header — same spacing on mobile bottom sheet and desktop drawer. */
export const PACKAGE_SUBSCRIBE_SHEET_HEADER_CLASS = PACKAGE_SUBSCRIBE_DESKTOP_HEADER_CLASS;

export const PACKAGE_SUBSCRIBE_SHEET_TITLE_CLASS = "ommm-package-subscribe-sheet-title";

export const PACKAGE_SUBSCRIBE_MOBILE_BODY_CLASS =
  "flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]";

export const PACKAGE_SUBSCRIBE_DESKTOP_BODY_CLASS =
  "flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]";

/** Fills sheet height; scroll lives in the form body, actions stay pinned. */
export const PACKAGE_SUBSCRIBE_FORM_CLASS =
  "flex min-h-0 flex-1 flex-col gap-0";

export const PACKAGE_SUBSCRIBE_FORM_SCROLL_CLASS =
  "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain pe-1";

export const PACKAGE_SUBSCRIBE_FORM_ACTIONS_CLASS = "shrink-0 pt-4";

export const PACKAGE_SUBSCRIBE_FORM_GRID_CLASS =
  "grid min-h-0 flex-1 grid-cols-1 gap-4 tablet:grid-cols-2";

export const PACKAGE_SUBSCRIBE_PLANS_COLUMN_CLASS =
  "min-h-0 flex flex-col overflow-hidden tablet:pe-1";

export const PACKAGE_SUBSCRIBE_PAYMENT_COLUMN_CLASS =
  "min-h-0 flex flex-col overflow-hidden tablet:ps-1";

/** Keep in sync with CSS transitions on the desktop panel. */
export const PACKAGE_SUBSCRIBE_DESKTOP_MOTION_MS = 440;

/** Keep in sync with CSS transitions on the mobile bottom sheet. */
export const PACKAGE_SUBSCRIBE_MOBILE_MOTION_MS = 420;
