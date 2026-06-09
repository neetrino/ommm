"use client";

import type { ReactNode } from "react";
import styles from "@/components/account/member-user-mobile-viewport.module.css";

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
  return (
    <div
      className={styles.root}
      data-mobile-sheet={hasMobileSheet ? "open" : "closed"}
    >
      {hasMobileSheet && hubBackdrop ? (
        <div className={styles.hubBackdrop}>{hubBackdrop}</div>
      ) : null}
      <div className={hasMobileSheet ? styles.routeContentWhenSheet : styles.routeContent}>
        {children}
      </div>
    </div>
  );
}
