import styles from "@/components/shell/workspace-mobile-drawer.module.css";

/** Class names for workspace mobile drawer — styles in `workspace-mobile-drawer.module.css`. */
export const workspaceMobileDrawerLayout = {
  overlayMobileOnly: styles.overlayMobileOnly,
  mobileDrawerTrigger: styles.mobileDrawerTrigger,
  desktopSidebar: styles.desktopSidebar,
  desktopSidebarSpacer: styles.desktopSidebarSpacer,
  memberHubDrawerOverlay: styles.memberHubDrawerOverlay,
  memberHubDrawerPanel: styles.memberHubDrawerPanel,
} as const;
