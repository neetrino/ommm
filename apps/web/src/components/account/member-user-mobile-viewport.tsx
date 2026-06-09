"use client";

import type { ReactNode } from "react";
import styles from "@/components/account/member-user-mobile-viewport.module.css";
import { MemberUserScrollRestoration } from "@/components/account/member-user-scroll-restoration";
import { useMemberHubSheetPhone } from "@/hooks/use-member-hub-sheet-phone";

type MemberUserMobileViewportProps = {
  /** Parallel `@sheet` slot is rendering an intercepted hub section. */
  hasMobileSheet: boolean;
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
  hubBackdrop,
  children,
}: MemberUserMobileViewportProps) {
  const isPhone = useMemberHubSheetPhone();
  const effectiveSheetOpen = isPhone && hasMobileSheet;

  return (
    <>
      <MemberUserScrollRestoration />
      <div
        className={styles.root}
        data-mobile-sheet={effectiveSheetOpen ? "open" : "closed"}
      >
        {effectiveSheetOpen && hubBackdrop ? (
          <div className={styles.hubBackdrop}>{hubBackdrop}</div>
        ) : null}
        <div
          className={effectiveSheetOpen ? styles.routeContentWhenSheet : styles.routeContent}
        >
          {children}
        </div>
      </div>
    </>
  );
}
