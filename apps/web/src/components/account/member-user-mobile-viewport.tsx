"use client";

import type { ReactNode } from "react";
import styles from "@/components/account/member-user-mobile-viewport.module.css";
import { MemberUserScrollRestoration } from "@/components/account/member-user-scroll-restoration";
import { usePreserveScrolledMemberHub } from "@/hooks/use-preserve-scrolled-member-hub";

type MemberUserMobileViewportProps = {
  /** Parallel `@sheet` slot is rendering an intercepted hub section. */
  hasMobileSheet: boolean;
  /** Notifications intercept route — desktop right-side panel. */
  hasDesktopNotificationsSheet: boolean;
  /** Account hub behind desktop notifications panel only. */
  hubBackdrop: ReactNode | null;
  children: ReactNode;
};

/**
 * Keeps scrolled hub DOM when opening a section from a scrolled account hub.
 * Hub section sheets use dimmed backdrop only — no duplicate hub panel behind.
 */
export function MemberUserMobileViewport({
  hasMobileSheet,
  hasDesktopNotificationsSheet,
  hubBackdrop,
  children,
}: MemberUserMobileViewportProps) {
  const preserveScrolledHub = usePreserveScrolledMemberHub(hasMobileSheet);

  return (
    <>
      <MemberUserScrollRestoration />
      <div
        className={styles.root}
        data-mobile-sheet={hasMobileSheet ? "open" : "closed"}
        data-desktop-notifications-sheet={
          hasDesktopNotificationsSheet ? "open" : "closed"
        }
        data-preserve-scrolled-hub={preserveScrolledHub ? "true" : "false"}
      >
        {hubBackdrop && hasDesktopNotificationsSheet ? (
          <div className={styles.hubBackdrop}>{hubBackdrop}</div>
        ) : null}
        <div
          className={
            hasMobileSheet || hasDesktopNotificationsSheet
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
