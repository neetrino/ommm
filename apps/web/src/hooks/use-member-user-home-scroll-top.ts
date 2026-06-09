"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { memberUserPathWithoutLocale } from "@/lib/member-user-hub-sheet-paths";
import { scheduleWorkspaceScrollReset } from "@/lib/reset-workspace-scroll";
import { USER_ACCOUNT_PATH } from "@/lib/role-home";

function isMemberUserHomePath(pathname: string): boolean {
  return memberUserPathWithoutLocale(pathname) === USER_ACCOUNT_PATH;
}

/**
 * Member `/user` hub — always open at the top on mobile (avoids mid-page scroll carry-over
 * from marketing home, sheets, sub-routes, or prior pages).
 */
export function useMemberUserHomeScrollTop(enabled: boolean): void {
  const pathname = usePathname();
  const shouldReset = enabled && isMemberUserHomePath(pathname);

  useLayoutEffect(() => {
    if (!shouldReset) {
      return undefined;
    }

    return scheduleWorkspaceScrollReset();
  }, [shouldReset, pathname]);

  useEffect(() => {
    if (!shouldReset) {
      return undefined;
    }

    return scheduleWorkspaceScrollReset({ includeDelayed: true });
  }, [shouldReset, pathname]);
}
