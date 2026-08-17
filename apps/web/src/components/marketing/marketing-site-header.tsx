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
  sessionReviewsAudience = null,
  sessionReviewsListHref = null,
}: MarketingSiteHeaderProps) {
  const pathname = usePathname();
  const [publicMenuOpen, setPublicMenuOpen] = useState(false);
  const marketingPath = pathname ?? "";
  const isMarketingHome = isMarketingHomePath(marketingPath);
  const isPolicyPage = isMarketingPolicyPath(marketingPath);
  const isWorkspaceChrome = workspaceHeaderChrome || workspaceDrawer !== undefined;
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
  const anyOverlayOpen = publicMenuOpen || workspaceDrawerOpen;
  const showMobileGlassPill = elevated && !anyOverlayOpen;
  const mobileGlassRowStyle = {
    ...marketingHeaderMobileRowWrapStyle(showMobileGlassPill),
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
      data-menu-open={anyOverlayOpen ? "true" : "false"}
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
            sessionReviewsAudience={sessionReviewsAudience}
            sessionReviewsListHref={sessionReviewsListHref}
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
          sessionReviewsAudience={sessionReviewsAudience}
          sessionReviewsListHref={sessionReviewsListHref}
          desktopGlassStyle={desktopGlassStyle}
          desktopNotificationsTriggerClass={desktopNotificationsTriggerClass}
          onBrandClick={handleBrandClick}
          onCloseAllMenus={closeAllMenus}
        />
      </div>

      {publicMenuOpen ? (
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
