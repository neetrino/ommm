/** Member hub sections opened as mobile bottom sheets (see `user/@sheet/(.)*` routes). */
export const MEMBER_USER_HUB_SHEET_PATHS = [
  "/user/bookings",
  "/user/waitlists",
  "/user/classes",
  "/user/packages",
  "/user/payments",
  "/user/gift-cards",
  "/user/profile",
] as const;

export function isMemberUserNotificationsPath(pathname: string): boolean {
  return memberUserPathWithoutLocale(pathname) === "/user/notifications";
}

/** Locale-stripped pathname — e.g. `/en/user/bookings` → `/user/bookings`. */
export function memberUserPathWithoutLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return "/";
  }
  const maybeLocale = segments[0];
  if (maybeLocale.length === 2) {
    const rest = segments.slice(1).join("/");
    return rest.length > 0 ? `/${rest}` : "/";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function isMemberUserHubSheetPath(pathname: string): boolean {
  const path = memberUserPathWithoutLocale(pathname);
  return MEMBER_USER_HUB_SHEET_PATHS.some(
    (sheetPath) => path === sheetPath || path.startsWith(`${sheetPath}/`),
  );
}
