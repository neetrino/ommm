"use client";

import type { ReactNode } from "react";
import styles from "@/components/account/member-user-mobile-viewport.module.css";
import { MemberUserScrollRestoration } from "@/components/account/member-user-scroll-restoration";
import { useMemberHubSheetPhone } from "@/hooks/use-member-hub-sheet-phone";

type MemberUserMobileViewportProps = {
  /** Parallel `@sheet` slot is rendering an intercepted route (notifications). */
  hasMobileSheet: boolean;
  /** Notifications intercept route — desktop right-side panel. */
  hasDesktopNotificationsSheet: boolean;
  /** Account hub behind desktop notifications panel only. */
  hubBackdrop: ReactNode | null;
  children: ReactNode;
};

/**
 * Desktop notifications use a hub backdrop behind the right-side panel.
 * Section routes soft-navigate into `children` like admin (no section intercepts).
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

  return (
    <>
      <MemberUserScrollRestoration />
      <div
        className={styles.root}
        data-mobile-sheet={effectiveMobileSheetOpen ? "open" : "closed"}
        data-desktop-notifications-sheet={
          effectiveDesktopNotificationsOpen ? "open" : "closed"
        }
        data-preserve-scrolled-hub={effectiveMobileSheetOpen ? "true" : "false"}
      >
        {effectiveDesktopNotificationsOpen && hubBackdrop ? (
          <div className={styles.hubBackdrop}>{hubBackdrop}</div>
        ) : null}
        <div
          className={
            effectiveDesktopNotificationsOpen
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
