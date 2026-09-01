"use client";

import { useState, type MouseEvent } from "react";
import { MarketingMobileMenuModal } from "@/components/marketing/marketing-mobile-menu-modal";
import {
  MarketingSiteHeaderDesktopBar,
  marketingHeaderNotificationTriggerClass,
} from "@/components/marketing/marketing-site-header-desktop-bar";
import { MarketingSiteHeaderMobileBar } from "@/components/marketing/marketing-site-header-mobile-bar";
import {
  marketingHeaderContainerClass,
  marketingHeaderMobileRowWrapClass,
  marketingHeaderMobileRowWrapStyle,
  marketingHeaderShellClass,
  MARKETING_MOBILE_HEADER,
  MARKETING_MOBILE_HEADER_ACTION_ICON_SIZE,
} from "@/components/marketing/marketing-site-header-layout";
import navPillStyles from "@/components/marketing/marketing-site-header-nav-pill.module.css";
import type { MarketingSiteHeaderProps } from "@/components/marketing/marketing-site-header.types";
import { useMarketingHeaderElevated } from "@/hooks/use-marketing-header-elevated";
import {
  isAuthPath,
  isMarketingHeroHeaderPath,
  isMarketingHomePath,
  isMarketingPolicyPath,
  isUserAccountPath,
} from "@/components/marketing/marketing-route-utils";
import { isMarketingNavLinkActive } from "@/components/marketing/marketing-nav-active";
import { usePathname } from "@/i18n/navigation";
import { USER_ACCOUNT_PATH } from "@/lib/role-home";

export type {
  MarketingHeaderAccount,
  MarketingSiteHeaderProps,
  WorkspaceDrawerControl,
} from "@/components/marketing/marketing-site-header.types";

/** Global site header — same chrome on marketing pages and authenticated workspaces. */
export function MarketingSiteHeader({
  navLinks,
  account = null,
  workspaceDrawer,
  workspaceHeaderChrome = false,
  memberWorkspaceHeader = false,
  notificationHref = null,
  notificationsLabel = null,
  showMemberNotifications = false,
  callTasksListHref = null,
  staffActivityListHref = null,
  sessionReviewsAudience = null,
  sessionReviewsListHref = null,
}: MarketingSiteHeaderProps) {
  const pathname = usePathname();
  const [publicMenuOpen, setPublicMenuOpen] = useState(false);
  const marketingPath = pathname ?? "";
  const isMarketingHome = isMarketingHomePath(marketingPath);
  const isPolicyPage = isMarketingPolicyPath(marketingPath);
  const isWorkspaceChrome = workspaceHeaderChrome || workspaceDrawer !== undefined;
  /** Staff uses olive panel drawer; members share the marketing home burger menu. */
  const usesPublicBurgerMenu = workspaceDrawer === undefined;
  const isAuthShell = isAuthPath(marketingPath);
  const isAccountShell =
    isWorkspaceChrome || isUserAccountPath(marketingPath) || isAuthShell;
  const scrollElevated = useMarketingHeaderElevated(
    !isWorkspaceChrome &&
      !isAuthShell &&
      isMarketingHeroHeaderPath(marketingPath),
  );
  const elevated = isWorkspaceChrome || isPolicyPage ? true : scrollElevated;
  const workspaceDrawerOpen = workspaceDrawer?.open ?? false;
  const publicMobileMenuOpen = publicMenuOpen && usesPublicBurgerMenu;
  const showMobileGlassPill = elevated && !publicMobileMenuOpen;
  const mobileGlassRowStyle = {
    ...marketingHeaderMobileRowWrapStyle(showMobileGlassPill),
    ["--marketing-mobile-glass-pill-action-icon-size" as string]:
      MARKETING_MOBILE_HEADER_ACTION_ICON_SIZE,
    ["--marketing-mobile-scrolled-pill-bg" as string]:
      MARKETING_MOBILE_HEADER.scrolledPillBackground,
  };
  const showWorkspaceNotifications =
    notificationHref !== null && notificationsLabel !== null;
  const showMemberNotificationsOnUserPath =
    showMemberNotifications && isUserAccountPath(marketingPath);
  const showNotifications =
    showWorkspaceNotifications || showMemberNotificationsOnUserPath;
  const notificationPreferencesHref =
    notificationHref ??
    (showMemberNotificationsOnUserPath ? "/user/notifications" : null);
  /** Member review star — only on `/user` (profile hub), not marketing Home. */
  const headerSessionReviewsAudience =
    sessionReviewsAudience === "member" && !isUserAccountPath(marketingPath)
      ? null
      : sessionReviewsAudience;
  const headerSessionReviewsListHref =
    headerSessionReviewsAudience != null ? sessionReviewsListHref : null;
  const desktopGlassStyle = {
    ["--marketing-glass-pill-bg" as string]:
      MARKETING_MOBILE_HEADER.scrolledPillBackground,
  };
  const desktopNotificationsTriggerClass = memberWorkspaceHeader
    ? marketingHeaderNotificationTriggerClass()
    : `hidden lg:inline-flex ${marketingHeaderNotificationTriggerClass()}`;
  const memberAvatarProfileHref = account?.href ?? USER_ACCOUNT_PATH;

  function handleBrandClick(event: MouseEvent<HTMLAnchorElement>) {
    setPublicMenuOpen(false);
    closeWorkspaceDrawer();
    if (!isMarketingHome) {
      return;
    }
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closePublicMenu() {
    setPublicMenuOpen(false);
  }

  function closeWorkspaceDrawer() {
    if (workspaceDrawerOpen) {
      workspaceDrawer?.onToggle();
    }
  }

  function closeAllMenus() {
    closePublicMenu();
    closeWorkspaceDrawer();
  }

  return (
    <header
      className={`${marketingHeaderShellClass()} ${navPillStyles.headerShell}`}
      data-account-shell={isAccountShell ? "true" : "false"}
      data-workspace-shell={isWorkspaceChrome ? "true" : "false"}
      data-elevated={elevated ? "true" : "false"}
      data-menu-open={publicMobileMenuOpen ? "true" : "false"}
    >
      <div className={marketingHeaderContainerClass()}>
        <div
          className={`${marketingHeaderMobileRowWrapClass()} ${navPillStyles.mobileHeaderBar}`}
          data-glass-active={showMobileGlassPill ? "true" : "false"}
          style={mobileGlassRowStyle}
        >
          <div aria-hidden className={navPillStyles.mobileHeaderBarGloss} />
          <MarketingSiteHeaderMobileBar
            publicMenuOpen={publicMenuOpen}
            showMobileGlassPill={showMobileGlassPill}
            workspaceDrawer={workspaceDrawer}
            workspaceDrawerOpen={workspaceDrawerOpen}
            memberWorkspaceHeader={memberWorkspaceHeader}
            memberAvatarProfileHref={memberAvatarProfileHref}
            showNotifications={showNotifications}
            notificationPreferencesHref={notificationPreferencesHref}
            callTasksListHref={callTasksListHref}
            staffActivityListHref={staffActivityListHref}
            sessionReviewsAudience={headerSessionReviewsAudience}
            sessionReviewsListHref={headerSessionReviewsListHref}
            account={account}
            onBrandClick={handleBrandClick}
            onTogglePublicMenu={() => setPublicMenuOpen((open) => !open)}
            onToggleWorkspaceDrawer={() => workspaceDrawer?.onToggle()}
            onCloseAllMenus={closeAllMenus}
          />
        </div>

        <MarketingSiteHeaderDesktopBar
          navLinks={navLinks}
          marketingPath={marketingPath}
          account={account}
          memberWorkspaceHeader={memberWorkspaceHeader}
          memberAvatarProfileHref={memberAvatarProfileHref}
          showNotifications={showNotifications}
          notificationPreferencesHref={notificationPreferencesHref}
          callTasksListHref={callTasksListHref}
          staffActivityListHref={staffActivityListHref}
          sessionReviewsAudience={headerSessionReviewsAudience}
          sessionReviewsListHref={headerSessionReviewsListHref}
          desktopGlassStyle={desktopGlassStyle}
          desktopNotificationsTriggerClass={desktopNotificationsTriggerClass}
          onBrandClick={handleBrandClick}
          onCloseAllMenus={closeAllMenus}
        />
      </div>

      {publicMenuOpen && usesPublicBurgerMenu ? (
        <MarketingMobileMenuModal
          isOpen={publicMenuOpen}
          onClose={() => setPublicMenuOpen(false)}
          navLinks={navLinks}
          marketingPath={marketingPath}
          isActive={(path, href, key) =>
            isMarketingNavLinkActive(path, href, key)
          }
        />
      ) : null}
    </header>
  );
}
