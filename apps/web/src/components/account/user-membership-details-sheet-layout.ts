/** Desktop membership details — liquid glass panel sliding in from the right. */
export const USER_MEMBERSHIP_DETAILS_DESKTOP_OVERLAY_CLASS =
  "ommm-user-membership-details-desktop-overlay";

export const USER_MEMBERSHIP_DETAILS_DESKTOP_BACKDROP_CLASS =
  "ommm-user-membership-details-desktop-backdrop";

export const USER_MEMBERSHIP_DETAILS_DESKTOP_PANEL_CLASS =
  "ommm-user-membership-details-desktop-panel";

/** Keep in sync with CSS transitions — matches member notifications panel. */
export const USER_MEMBERSHIP_DETAILS_DESKTOP_MOTION_MS = 440;

import { MEMBER_ACCOUNT_HUB_SHEET_MOTION_MS } from "@/components/account/member-account-hub-sheet-layout";

/** Mobile bottom sheet — slide-up motion on phones. */
export const USER_MEMBERSHIP_DETAILS_MOBILE_OVERLAY_CLASS =
  "ommm-member-hub-sheet-overlay ommm-user-membership-details-mobile-overlay";

export const USER_MEMBERSHIP_DETAILS_MOBILE_PANEL_CLASS =
  "ommm-member-hub-sheet-panel ommm-user-membership-details-mobile-panel";

/** Keep in sync with CSS transitions on the mobile panel. */
export const USER_MEMBERSHIP_DETAILS_MOBILE_MOTION_MS = MEMBER_ACCOUNT_HUB_SHEET_MOTION_MS;
