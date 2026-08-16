import type { MarketingNavKey } from "@/components/marketing/marketing-nav-links";

/** Logged-in viewer summary used to swap the login icon for a profile avatar. */
export type MarketingHeaderAccount = {
  /** Locale-free destination for the avatar link (role home / member dashboard). */
  href: string;
  initials: string;
  imageSrc: string | null;
  displayName: string;
};

export type WorkspaceDrawerControl = {
  open: boolean;
  onToggle: () => void;
};

export type MarketingSiteHeaderProps = {
  navLinks: readonly { readonly href: string; readonly key: MarketingNavKey }[];
  account?: MarketingHeaderAccount | null;
  /** Mobile/tablet sidebar drawer for authenticated dashboards. */
  workspaceDrawer?: WorkspaceDrawerControl;
  /** Header above workspace shell — offset sync and elevated chrome even without a drawer control. */
  workspaceHeaderChrome?: boolean;
  /** Member workspace — mobile navbar keeps bell + avatar (tap avatar for logout); tablet+ also keeps globe. */
  memberWorkspaceHeader?: boolean;
  notificationHref?: string | null;
  notificationsLabel?: string | null;
  notificationsActive?: boolean;
  /** Member users on public pages — show waitlist notification bell. */
  showMemberNotifications?: boolean;
  /** Admin/manager workspace — due call-task reminder menu. */
  callTasksListHref?: string | null;
};
