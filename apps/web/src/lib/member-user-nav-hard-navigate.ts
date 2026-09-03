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
 * Desktop member nav uses full document navigation so `@sheet/(.)*` intercepts
 * do not freeze the previous route in `children`. Phone keeps soft-nav sheets.
 */
export function shouldMemberHardNavigate(pathname: string, targetHref: string): boolean {
  const current = memberUserPathWithoutLocale(pathname);
  const target = targetHref;

  if (isMemberInterceptSectionPath(current) || isMemberInterceptSectionPath(target)) {
    return true;
  }

  return isMemberHomePath(current) !== isMemberHomePath(target);
}
