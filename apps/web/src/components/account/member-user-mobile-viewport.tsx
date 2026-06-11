"use client";

import type { ReactNode } from "react";
import styles from "@/components/account/member-user-mobile-viewport.module.css";
import { MemberUserScrollRestoration } from "@/components/account/member-user-scroll-restoration";
import { useMemberHubSheetPhone } from "@/hooks/use-member-hub-sheet-phone";
import { peekMemberHubSheetScrollY } from "@/lib/member-hub-sheet-navigation";

type MemberUserMobileViewportProps = {
  /** Parallel `@sheet` slot is rendering an intercepted hub section. */
  hasMobileSheet: boolean;
  /** Notifications intercept route — desktop right-side panel. */
  hasDesktopNotificationsSheet: boolean;
  /** Account hub rendered behind the bottom sheet on phones. */
  hubBackdrop: ReactNode | null;
  children: ReactNode;
};

/**
 * Keeps the mobile account hub visible while hub section sheets are open.
 * Without this, soft navigation swaps `children` to the full desktop-style page
 * and the old layout flashes above the sheet during transitions.
 */
export function MemberUserMobileViewport({
  hasMobileSheet,
  hasDesktopNotificationsSheet,
  hubBackdrop,
  children,
}: MemberUserMobileViewportProps) {
  const isPhone = useMemberHubSheetPhone();
  const effectiveMobileSheetOpen = isPhone && hasMobileSheet;
  const effectiveDesktopNotificationsOpen = !isPhone && hasDesktopNotificationsSheet;
  /** Intercepted sheet from scrolled hub — keep existing hub DOM instead of remounting a copy. */
  const preserveScrolledHub =
    effectiveMobileSheetOpen && peekMemberHubSheetScrollY() !== null;
  const hideRouteForSheet = effectiveMobileSheetOpen && !preserveScrolledHub;
  const showHubBackdrop = hideRouteForSheet && hubBackdrop;

  return (
    <>
      <MemberUserScrollRestoration />
      <div
        className={styles.root}
        data-mobile-sheet={effectiveMobileSheetOpen ? "open" : "closed"}
        data-desktop-notifications-sheet={
          effectiveDesktopNotificationsOpen ? "open" : "closed"
        }
      >
        {showHubBackdrop ? <div className={styles.hubBackdrop}>{hubBackdrop}</div> : null}
        <div
          className={
            hideRouteForSheet || effectiveDesktopNotificationsOpen
              ? styles.routeContentWhenSheet
              : styles.routeContent
          }
        >
          {children}
        </div>
      </div>
    </>
  );
}
