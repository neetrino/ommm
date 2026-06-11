"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import {
  clearMemberHubSheetScrollY,
  peekMemberHubSheetScrollY,
} from "@/lib/member-hub-sheet-navigation";
import { memberUserPathWithoutLocale } from "@/lib/member-user-hub-sheet-paths";
import {
  restoreWorkspaceScrollPosition,
  scheduleWorkspaceScrollReset,
} from "@/lib/reset-workspace-scroll";
import { USER_ACCOUNT_PATH } from "@/lib/role-home";

function isMemberUserHomePath(pathname: string): boolean {
  return memberUserPathWithoutLocale(pathname) === USER_ACCOUNT_PATH;
}

function consumeMemberHubSheetScrollY(): number | null {
  const scrollY = peekMemberHubSheetScrollY();
  if (scrollY === null) {
    return null;
  }
  clearMemberHubSheetScrollY();
  return scrollY;
}

/**
 * Member `/user` hub — open at the top on fresh entry, but restore scroll when returning
 * from a hub bottom sheet the user opened while scrolled.
 */
export function useMemberUserHomeScrollTop(enabled: boolean): void {
  const pathname = usePathname();
  const shouldReset = enabled && isMemberUserHomePath(pathname);
  const restoredFromSheetRef = useRef(false);

  useLayoutEffect(() => {
    if (!shouldReset) {
      restoredFromSheetRef.current = false;
      return undefined;
    }

    const preservedScrollY = consumeMemberHubSheetScrollY();
    if (preservedScrollY !== null) {
      restoredFromSheetRef.current = true;
      restoreWorkspaceScrollPosition(preservedScrollY);
      return undefined;
    }

    restoredFromSheetRef.current = false;
    return scheduleWorkspaceScrollReset();
  }, [shouldReset, pathname]);

  useEffect(() => {
    if (!shouldReset || restoredFromSheetRef.current) {
      return undefined;
    }

    return scheduleWorkspaceScrollReset({ includeDelayed: true });
  }, [shouldReset, pathname]);
}
