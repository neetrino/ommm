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
 * Member `/user` — scroll to top on soft client navigations (same idea as admin).
 * Closing the notifications panel back to the hub keeps scroll via
 * {@link releaseBodyScrollLockEarly} / {@link isReturningToMemberHubFromSheet}.
 */
export function useMemberUserHomeScrollTop(enabled: boolean): void {
  const pathname = usePathname();
  const previousPathnameRef = useRef<string | null>(null);
  const skipDelayedResetRef = useRef(false);

  useLayoutEffect(() => {
    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = pathname;

    if (!enabled) {
      skipDelayedResetRef.current = false;
      return undefined;
    }

    if (isReturningToMemberHubFromSheet(pathname, previousPathname)) {
      skipDelayedResetRef.current = true;
      return undefined;
    }

    if (previousPathname === null && !isMemberUserHomePath(pathname)) {
      skipDelayedResetRef.current = false;
      return scheduleWorkspaceScrollReset();
    }

    if (previousPathname === pathname) {
      skipDelayedResetRef.current = true;
      return undefined;
    }

    if (isMemberUserHomePath(pathname)) {
      clearMemberHubSheetScrollY();
    }

    skipDelayedResetRef.current = false;
    return scheduleWorkspaceScrollReset();
  }, [enabled, pathname]);

  useEffect(() => {
    if (!enabled || skipDelayedResetRef.current) {
      return undefined;
    }

    return scheduleWorkspaceScrollReset({ includeDelayed: true });
  }, [enabled, pathname]);
}
