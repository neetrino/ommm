export const OMMM_OVERLAY_PORTAL_ID = "ommm-overlay-portal";

/** Above fixed marketing header (`z-50`), member hub sheet (`z-105`), filter panel (`z-125`). */
export const OMMM_OVERLAY_PORTAL_Z_INDEX = 130;

/** Inline z-index for portaled floating menus within {@link OMMM_OVERLAY_PORTAL_Z_INDEX}. */
export const OMMM_FLOATING_MENU_Z_INDEX = 200;

/** Dedicated body portal layer so floating menus stack above modals and the site header. */
export function getOmmmOverlayPortalRoot(): HTMLElement {
  const existing = document.getElementById(OMMM_OVERLAY_PORTAL_ID);
  if (existing !== null) {
    return existing;
  }

  const root = document.createElement("div");
  root.id = OMMM_OVERLAY_PORTAL_ID;
  root.style.zIndex = String(OMMM_OVERLAY_PORTAL_Z_INDEX);
  document.body.appendChild(root);
  return root;
}
