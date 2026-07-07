export const PACKAGES_REFRESH_EVENT = "ommm:packages-refresh";

/** Signals member package views to refetch `/packages/me`. */
export function dispatchPackagesRefresh(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(PACKAGES_REFRESH_EVENT));
}
