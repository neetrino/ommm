import styles from "@/components/shell/workspace-mobile-drawer.module.css";

/** Keep in sync with drawer panel/scrim transitions in `workspace-mobile-drawer.module.css`. */
export const WORKSPACE_MOBILE_DRAWER_MOTION_MS = 420;

/** Class names for workspace mobile drawer — styles in `workspace-mobile-drawer.module.css`. */
export const workspaceMobileDrawerLayout = {
  overlayMobileOnly: styles.overlayMobileOnly,
  mobileDrawerTrigger: styles.mobileDrawerTrigger,
  desktopSidebar: styles.desktopSidebar,
  desktopSidebarSpacer: styles.desktopSidebarSpacer,
  memberHubDrawerOverlay: styles.memberHubDrawerOverlay,
  memberHubDrawerPanel: styles.memberHubDrawerPanel,
  drawerScrim: styles.drawerScrim,
  drawerScrimVisible: styles.drawerScrimVisible,
  drawerPanel: styles.drawerPanel,
  drawerPanelVisible: styles.drawerPanelVisible,
} as const;
