/** Above fixed marketing header (`z-50`) and mobile nav sheet (`z-40`). */
export const OMMM_OVERLAY_PORTAL_ID = "ommm-overlay-portal";

/** Inline z-index for portaled floating menus — matches account avatar popover. */
export const OMMM_FLOATING_MENU_Z_INDEX = 200;

/** Dedicated body portal layer so floating menus stack above the fixed site header. */
export function getOmmmOverlayPortalRoot(): HTMLElement {
  const existing = document.getElementById(OMMM_OVERLAY_PORTAL_ID);
  if (existing !== null) {
    return existing;
  }

  const root = document.createElement("div");
  root.id = OMMM_OVERLAY_PORTAL_ID;
  document.body.appendChild(root);
  return root;
}
