"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import { clearMemberHubSheetScrollY } from "@/lib/member-hub-sheet-navigation";
import {
  isReturningToMemberHubFromSheet,
  memberUserPathWithoutLocale,
} from "@/lib/member-user-hub-sheet-paths";
import { scheduleWorkspaceScrollReset } from "@/lib/reset-workspace-scroll";
import { USER_ACCOUNT_PATH } from "@/lib/role-home";

function isMemberUserHomePath(pathname: string): boolean {
  return memberUserPathWithoutLocale(pathname) === USER_ACCOUNT_PATH;
}

/**
 * Member `/user` hub — scroll to top on fresh entry only.
 * Hub sheet close restores scroll in {@link releaseBodyScrollLockEarly} before `router.back()`.
 */
export function useMemberUserHomeScrollTop(enabled: boolean): void {
  const pathname = usePathname();
  const previousPathnameRef = useRef<string | null>(null);
  const shouldReset = enabled && isMemberUserHomePath(pathname);
  const skipDelayedResetRef = useRef(false);

  useLayoutEffect(() => {
    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = pathname;

    if (!shouldReset) {
      skipDelayedResetRef.current = false;
      return undefined;
    }

    if (isReturningToMemberHubFromSheet(pathname, previousPathname)) {
      skipDelayedResetRef.current = true;
      return undefined;
    }

    clearMemberHubSheetScrollY();
    skipDelayedResetRef.current = false;
    return scheduleWorkspaceScrollReset();
  }, [shouldReset, pathname]);

  useEffect(() => {
    if (!shouldReset || skipDelayedResetRef.current) {
      return undefined;
    }

    return scheduleWorkspaceScrollReset({ includeDelayed: true });
  }, [shouldReset, pathname]);
}
