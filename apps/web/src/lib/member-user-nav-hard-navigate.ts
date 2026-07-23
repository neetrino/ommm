import { USER_ACCOUNT_PATH, USER_DASHBOARD_PATH } from "@/lib/role-home";
import {
  isMemberUserHubSheetPath,
  isMemberUserNotificationsPath,
  memberUserPathWithoutLocale,
} from "@/lib/member-user-hub-sheet-paths";

function isMemberHomePath(path: string): boolean {
  return path === USER_ACCOUNT_PATH || path === USER_DASHBOARD_PATH;
}

function isMemberInterceptSectionPath(path: string): boolean {
  return isMemberUserHubSheetPath(path) || isMemberUserNotificationsPath(path);
}

/**
 * Member hub sections use Next.js intercept routes in `user/@sheet/(.)*`.
 * Client navigation between sections keeps the previous page in `children` and
 * renders the target only in the sheet slot (hidden on desktop) — e.g. stuck on My bookings.
 * Full document navigation updates `children` on all viewports.
 */
export function shouldMemberHardNavigate(pathname: string, targetHref: string): boolean {
  const current = memberUserPathWithoutLocale(pathname);
  const target = targetHref;

  if (isMemberInterceptSectionPath(current) || isMemberInterceptSectionPath(target)) {
    return true;
  }

  return isMemberHomePath(current) !== isMemberHomePath(target);
}
