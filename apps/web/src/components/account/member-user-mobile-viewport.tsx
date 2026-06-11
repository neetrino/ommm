"use client";

import type { ReactNode } from "react";
import { MemberHubBackdropScrollPane } from "@/components/account/member-hub-backdrop-scroll-pane";
import styles from "@/components/account/member-user-mobile-viewport.module.css";
import { MemberUserScrollRestoration } from "@/components/account/member-user-scroll-restoration";
import {
  readMemberHubSheetPhoneViewport,
  useMemberHubSheetPhone,
} from "@/hooks/use-member-hub-sheet-phone";
import { peekMemberHubSheetNavigation } from "@/lib/member-hub-sheet-navigation";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";

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
  const clientMounted = useIsClientMounted();
  const isPhone = useMemberHubSheetPhone();
  const showMobileSheetChrome =
    hasMobileSheet &&
    (isPhone ||
      !clientMounted ||
      peekMemberHubSheetNavigation() ||
      readMemberHubSheetPhoneViewport());
  const effectiveMobileSheetOpen = showMobileSheetChrome;
  const effectiveDesktopNotificationsOpen = !isPhone && hasDesktopNotificationsSheet;
  const showHubBackdrop = effectiveMobileSheetOpen && hubBackdrop;

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
        {showHubBackdrop ? (
          <div className={styles.hubBackdrop}>
            <MemberHubBackdropScrollPane>{hubBackdrop}</MemberHubBackdropScrollPane>
          </div>
        ) : null}
        <div
          className={
            effectiveMobileSheetOpen || effectiveDesktopNotificationsOpen
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
