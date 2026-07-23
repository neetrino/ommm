/**
 * Desktop member hub — matches {@link member-user-home-viewports.module.css}.
 * Touch phones/tablets use the mobile hub even when the viewport is wide.
 */
export const MEMBER_ACCOUNT_HUB_DESKTOP_VIEWPORT_MEDIA_QUERY =
  "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

/** True on fine-pointer desktop where the legacy dashboard hub rows are shown. */
export function readMemberAccountHubDesktopViewport(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia(MEMBER_ACCOUNT_HUB_DESKTOP_VIEWPORT_MEDIA_QUERY).matches;
}
