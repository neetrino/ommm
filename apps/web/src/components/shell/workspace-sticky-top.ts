/** CSS variable — `0` inside the workspace scroll pane; unset on document scroll routes. */
export const OMMM_WORKSPACE_STICKY_TOP_VAR = "--ommm-workspace-sticky-top";

/**
 * Sticky `top` for dashboard page headers and toolbars.
 * Workspace shells scroll inside a pane below the fixed site header, so nested stickies use `0`.
 */
export const WORKSPACE_STICKY_TOPCSSValue =
  "var(--ommm-workspace-sticky-top, var(--ommm-marketing-site-header-offset, 4.25rem))";
