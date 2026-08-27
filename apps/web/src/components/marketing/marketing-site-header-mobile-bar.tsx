"use client";

import type { MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import {
  MarketingHeaderGlobeIcon,
  MarketingHeaderMenuIcon,
  MarketingHeaderUserIcon,
} from "@/components/marketing/marketing-header-icons";
import { MarketingHeaderLoginLink } from "@/components/marketing/marketing-header-login-link";
import { MarketingAccountAvatarMenu } from "@/components/marketing/marketing-account-avatar-menu";
import {
  marketingHeaderIconButtonClass,
  marketingHeaderMobileActionsClass,
  marketingHeaderMobileBrandLinkClass,
  marketingHeaderMobileBrandTextClass,
  marketingHeaderMobileLeadingClass,
  marketingHeaderMobileIconAccountClass,
  marketingHeaderMobileLanguageTriggerClass,
  marketingHeaderMobileMenuButtonClass,
  marketingHeaderMobileRowInnerClass,
} from "@/components/marketing/marketing-site-header-layout";
import navPillStyles from "@/components/marketing/marketing-site-header-nav-pill.module.css";
import type {
  MarketingHeaderAccount,
  WorkspaceDrawerControl,
} from "@/components/marketing/marketing-site-header.types";
import { HeaderCallTasksMenu } from "@/components/shell/header-call-tasks-menu";
import { HeaderNotificationsMenu } from "@/components/shell/header-notifications-menu";
import { HeaderSessionReviewsMenu } from "@/components/shell/header-session-reviews-menu";
import { HeaderStaffActivityMenu } from "@/components/shell/header-staff-activity-menu";
import type { SessionReviewsAudience } from "@/lib/session-reviews-types";
import { workspaceMobileDrawerLayout } from "@/components/shell/workspace-mobile-drawer-layout";
import { Link } from "@/i18n/navigation";
import { MarketingSiteHeaderWorkspaceDrawerGlyph } from "@/components/marketing/marketing-site-header-workspace-glyph";

type MarketingSiteHeaderMobileBarProps = {
  publicMenuOpen: boolean;
  showMobileGlassPill: boolean;
  workspaceDrawer?: WorkspaceDrawerControl;
  workspaceDrawerOpen: boolean;
  memberWorkspaceHeader: boolean;
  memberAvatarProfileHref: string;
  showNotifications: boolean;
  notificationPreferencesHref: string | null;
  callTasksListHref?: string | null;
  staffActivityListHref?: string | null;
  sessionReviewsAudience?: SessionReviewsAudience | null;
  sessionReviewsListHref?: string | null;
  account: MarketingHeaderAccount | null;
  onBrandClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onTogglePublicMenu: () => void;
  onToggleWorkspaceDrawer: () => void;
  onCloseAllMenus: () => void;
};

export function MarketingSiteHeaderMobileBar({
  publicMenuOpen,
  workspaceDrawer,
  workspaceDrawerOpen,
  memberWorkspaceHeader,
  memberAvatarProfileHref,
  showNotifications,
  notificationPreferencesHref,
  callTasksListHref = null,
  staffActivityListHref = null,
  sessionReviewsAudience = null,
  sessionReviewsListHref = null,
  account,
  onBrandClick,
  onTogglePublicMenu,
  onToggleWorkspaceDrawer,
  onCloseAllMenus,
}: MarketingSiteHeaderMobileBarProps) {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tUi = useTranslations("marketingUi");
  const tShell = useTranslations("dashboard.shell");
  const isWorkspaceMobile = workspaceDrawer !== undefined;

  const menuButton = (
    <button
      type="button"
      className={`${marketingHeaderMobileMenuButtonClass(publicMenuOpen)} ${navPillStyles.mobileHeaderMenuButton}`}
      aria-expanded={publicMenuOpen}
      aria-controls="marketing-mobile-nav"
      aria-label={publicMenuOpen ? tUi("closeMenu") : tUi("openMenu")}
      onClick={onTogglePublicMenu}
    >
      <span className="sr-only">{tUi("menuSr")}</span>
      {publicMenuOpen ? (
        <svg
          className={`${navPillStyles.mobileHeaderMenuIcon} shrink-0`}
          viewBox="0 0 35 35"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          aria-hidden
        >
          <path d="M10 10l15 15M25 10L10 25" strokeLinecap="round" />
        </svg>
      ) : (
        <MarketingHeaderMenuIcon className={`${navPillStyles.mobileHeaderMenuIcon} shrink-0`} />
      )}
    </button>
  );

  const brandLink = (
    <Link
      href="/"
      className={marketingHeaderMobileBrandLinkClass({ workspace: isWorkspaceMobile })}
      onClick={onBrandClick}
    >
      <span
        className={`${marketingHeaderMobileBrandTextClass()} ${navPillStyles.mobileHeaderBrandText}`}
      >
        {tNav("spaceBrand")}
      </span>
    </Link>
  );

  return (
    <div className={`${marketingHeaderMobileRowInnerClass()} ${navPillStyles.mobileHeaderRow}`}>
      {isWorkspaceMobile ? (
        <div className={marketingHeaderMobileLeadingClass()}>
          {menuButton}
          {brandLink}
        </div>
      ) : (
        <>
          {menuButton}
          {brandLink}
        </>
      )}

      <div className={marketingHeaderMobileActionsClass()}>
        {workspaceDrawer ? (
          <button
            type="button"
            className={`${marketingHeaderIconButtonClass()} ${navPillStyles.mobileHeaderAccountButton} ${workspaceMobileDrawerLayout.mobileDrawerTrigger}`}
            aria-expanded={workspaceDrawerOpen}
            aria-controls="dashboard-mobile-drawer"
            aria-label={workspaceDrawerOpen ? tShell("closeMenu") : tShell("openMenu")}
            onClick={onToggleWorkspaceDrawer}
          >
            <MarketingSiteHeaderWorkspaceDrawerGlyph />
            <span className="sr-only">{tShell("workspaceAria")}</span>
          </button>
        ) : null}
        {memberWorkspaceHeader ? (
          <>
            {sessionReviewsAudience && sessionReviewsListHref ? (
              <HeaderSessionReviewsMenu
                audience={sessionReviewsAudience}
                viewAllHref={sessionReviewsListHref}
                triggerClassName={`${marketingHeaderMobileLanguageTriggerClass()} ${navPillStyles.mobileHeaderLanguageTrigger}`}
                iconClassName={`${navPillStyles.mobileHeaderActionIcon} shrink-0`}
                onNavigate={onCloseAllMenus}
              />
            ) : null}
            {staffActivityListHref ? (
              <HeaderStaffActivityMenu
                enabled
                viewAllHref={staffActivityListHref}
                triggerClassName={`${marketingHeaderMobileLanguageTriggerClass()} ${navPillStyles.mobileHeaderLanguageTrigger}`}
                iconClassName={`${navPillStyles.mobileHeaderActionIcon} shrink-0`}
                onNavigate={onCloseAllMenus}
              />
            ) : showNotifications ? (
              <HeaderNotificationsMenu
                enabled
                preferencesHref={notificationPreferencesHref}
                triggerClassName={`${marketingHeaderMobileLanguageTriggerClass()} ${navPillStyles.mobileHeaderLanguageTrigger}`}
                iconClassName={`${navPillStyles.mobileHeaderActionIcon} shrink-0`}
                onNavigate={onCloseAllMenus}
              />
            ) : null}
            {callTasksListHref ? (
              <HeaderCallTasksMenu
                enabled
                listHref={callTasksListHref}
                triggerClassName={`${marketingHeaderMobileLanguageTriggerClass()} ${navPillStyles.mobileHeaderLanguageTrigger}`}
                iconClassName={`${navPillStyles.mobileHeaderActionIcon} shrink-0`}
                onNavigate={onCloseAllMenus}
              />
            ) : null}
            {account ? (
              <MarketingAccountAvatarMenu
                initials={account.initials}
                imageSrc={account.imageSrc}
                displayName={account.displayName}
                profileHref={memberAvatarProfileHref}
                hardNavigate
                triggerClassName={`${marketingHeaderMobileIconAccountClass()} ${navPillStyles.mobileHeaderAccountButton}`}
                avatarClassName={navPillStyles.mobileHeaderAvatar}
                guestIconClassName={`${navPillStyles.mobileHeaderGuestUserIcon} shrink-0`}
                onAfterSelect={onCloseAllMenus}
              />
            ) : null}
          </>
        ) : (
          <>
            {sessionReviewsAudience && sessionReviewsListHref ? (
              <HeaderSessionReviewsMenu
                audience={sessionReviewsAudience}
                viewAllHref={sessionReviewsListHref}
                triggerClassName={`${marketingHeaderMobileLanguageTriggerClass()} ${navPillStyles.mobileHeaderLanguageTrigger}`}
                iconClassName={`${navPillStyles.mobileHeaderActionIcon} shrink-0`}
                onNavigate={onCloseAllMenus}
              />
            ) : null}
            {staffActivityListHref ? (
              <HeaderStaffActivityMenu
                enabled
                viewAllHref={staffActivityListHref}
                triggerClassName={`${marketingHeaderMobileLanguageTriggerClass()} ${navPillStyles.mobileHeaderLanguageTrigger}`}
                iconClassName={`${navPillStyles.mobileHeaderActionIcon} shrink-0`}
                onNavigate={onCloseAllMenus}
              />
            ) : showNotifications ? (
              <HeaderNotificationsMenu
                enabled
                preferencesHref={notificationPreferencesHref}
                triggerClassName={`${marketingHeaderMobileLanguageTriggerClass()} ${navPillStyles.mobileHeaderLanguageTrigger}`}
                iconClassName={`${navPillStyles.mobileHeaderActionIcon} shrink-0`}
                onNavigate={onCloseAllMenus}
              />
            ) : null}
            {callTasksListHref ? (
              <HeaderCallTasksMenu
                enabled
                listHref={callTasksListHref}
                triggerClassName={`${marketingHeaderMobileLanguageTriggerClass()} ${navPillStyles.mobileHeaderLanguageTrigger}`}
                iconClassName={`${navPillStyles.mobileHeaderActionIcon} shrink-0`}
                onNavigate={onCloseAllMenus}
              />
            ) : null}
            <LanguageSwitcher
              context="marketing"
              appearance="icon"
              className="min-w-0 shrink-0"
              triggerClassName={`${marketingHeaderMobileLanguageTriggerClass()} ${navPillStyles.mobileHeaderLanguageTrigger}`}
              onAfterSelect={onCloseAllMenus}
              renderIconTrigger={() => (
                <MarketingHeaderGlobeIcon
                  className={`${navPillStyles.mobileHeaderActionIcon} shrink-0`}
                />
              )}
            />
            {account ? (
              <MarketingAccountAvatarMenu
                initials={account.initials}
                imageSrc={account.imageSrc}
                displayName={account.displayName}
                profileHref={account.href}
                triggerClassName={`${marketingHeaderMobileIconAccountClass()} ${navPillStyles.mobileHeaderAccountButton}`}
                avatarClassName={navPillStyles.mobileHeaderAvatar}
                guestIconClassName={`${navPillStyles.mobileHeaderGuestUserIcon} shrink-0`}
                onAfterSelect={onCloseAllMenus}
              />
            ) : (
              <MarketingHeaderLoginLink
                className={`${marketingHeaderMobileIconAccountClass()} ${navPillStyles.mobileHeaderAccountButton}`}
                ariaLabel={tCommon("login")}
                onNavigate={onCloseAllMenus}
              >
                <MarketingHeaderUserIcon
                  className={`${navPillStyles.mobileHeaderGuestUserIcon} shrink-0`}
                />
              </MarketingHeaderLoginLink>
            )}
          </>
        )}
      </div>
    </div>
  );
}
