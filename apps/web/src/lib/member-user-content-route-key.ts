import {
  isMemberUserHubSheetPath,
  memberUserPathWithoutLocale,
} from "@/lib/member-user-hub-sheet-paths";
import { USER_ACCOUNT_PATH } from "@/lib/role-home";

/**
 * Stable key for member `/user` enter animation — intercept sheet URLs keep the hub
 * in `children`, so `/user/bookings` must not remount the account hub on open/close.
 */
export function memberUserContentRouteKey(pathname: string): string {
  const path = memberUserPathWithoutLocale(pathname);
  if (path === USER_ACCOUNT_PATH || isMemberUserHubSheetPath(path)) {
    return USER_ACCOUNT_PATH;
  }
  return path;
}
