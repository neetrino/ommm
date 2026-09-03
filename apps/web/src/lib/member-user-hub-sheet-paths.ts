import { USER_ACCOUNT_PATH } from "@/lib/role-home";

/**
 * Member hub sections previously opened as mobile bottom sheets via `@sheet/(.)*`.
 * Those intercepts were removed so `/user/*` soft-navigates like admin (children update).
 * Notifications keep a dedicated intercept + {@link isMemberUserNotificationsPath}.
 */
export const MEMBER_USER_HUB_SHEET_PATHS = [] as const;

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

/** Closing notifications / legacy sheet via `router.back()` — keep hub scroll. */
export function isReturningToMemberHubFromSheet(
  currentPathname: string,
  previousPathname: string | null,
): boolean {
  if (previousPathname === null) {
    return false;
  }

  const previous = memberUserPathWithoutLocale(previousPathname);
  return (
    memberUserPathWithoutLocale(currentPathname) === USER_ACCOUNT_PATH &&
    (isMemberUserHubSheetPath(previousPathname) ||
      previous === "/user/notifications")
  );
}
