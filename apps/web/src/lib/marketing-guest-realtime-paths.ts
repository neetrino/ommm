/** Marketing routes where guests need the public SSE stream (live schedule surfaces). */
export function marketingPathNeedsGuestRealtime(localeFreePath: string): boolean {
  const path = localeFreePath === "" ? "/" : localeFreePath;
  if (path === "/") {
    return true;
  }
  if (path === "/schedule" || path.startsWith("/schedule/")) {
    return true;
  }
  return false;
}
