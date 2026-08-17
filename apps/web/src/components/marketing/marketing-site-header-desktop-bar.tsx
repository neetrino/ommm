"use client";

import { useLocale, useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import {
  MarketingHeaderGlobeIcon,
  MarketingHeaderUserIcon,
} from "@/components/marketing/marketing-header-icons";
import { MarketingHeaderLoginLink } from "@/components/marketing/marketing-header-login-link";
import type { MarketingNavKey } from "@/components/marketing/marketing-nav-links";
import { MarketingAccountAvatarMenu } from "@/components/marketing/marketing-account-avatar-menu";
import {
  isCompactMarketingHeaderLocale,
  marketingHeaderAuthClusterClass,
  marketingHeaderDesktopActionsClass,
  marketingHeaderDesktopBrandLinkClass,
  marketingHeaderDesktopBrandTextClass,
  marketingHeaderDesktopNavClass,
  marketingHeaderDesktopRowClass,
  marketingHeaderIconAccountClass,
  marketingHeaderLanguageTriggerClass,
  marketingHeaderNavLinksClass,
  marketingHeaderNavPillLinkClass,
  marketingHeaderNotificationTriggerClass,
  MARKETING_HEADER_DESKTOP_ACTION_ICON_CLASS,
  MARKETING_HEADER_DESKTOP_AVATAR_CLASS,
  MARKETING_HEADER_GUEST_USER_ICON_CLASS,
} from "@/components/marketing/marketing-site-header-layout";
import navPillStyles from "@/components/marketing/marketing-site-header-nav-pill.module.css";
import type { MarketingHeaderAccount } from "@/components/marketing/marketing-site-header.types";
import { isMarketingNavLinkActive } from "@/components/marketing/marketing-nav-active";
import { HeaderCallTasksMenu } from "@/components/shell/header-call-tasks-menu";
import { HeaderNotificationsMenu } from "@/components/shell/header-notifications-menu";
import { HeaderSessionReviewsMenu } from "@/components/shell/header-session-reviews-menu";
import type { SessionReviewsAudience } from "@/lib/session-reviews-types";
import { Link } from "@/i18n/navigation";
import { USER_ACCOUNT_PATH } from "@/lib/role-home";
import type { MouseEvent } from "react";

type MarketingSiteHeaderDesktopBarProps = {
  navLinks: readonly { readonly href: string; readonly key: MarketingNavKey }[];
  marketingPath: string;
  account: MarketingHeaderAccount | null;
  memberWorkspaceHeader: boolean;
  memberAvatarProfileHref: string;
  showNotifications: boolean;
  notificationPreferencesHref: string | null;
  callTasksListHref?: string | null;
  sessionReviewsAudience?: SessionReviewsAudience | null;
  sessionReviewsListHref?: string | null;
  desktopGlassStyle: Record<string, string>;
  desktopNotificationsTriggerClass: string;
  onBrandClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onCloseAllMenus: () => void;
};

export function MarketingSiteHeaderDesktopBar({
  navLinks,
  marketingPath,
  account,
  memberWorkspaceHeader,
  memberAvatarProfileHref,
  showNotifications,
  notificationPreferencesHref,
  callTasksListHref = null,
  sessionReviewsAudience = null,
  sessionReviewsListHref = null,
  desktopGlassStyle,
  desktopNotificationsTriggerClass,
  onBrandClick,
  onCloseAllMenus,
}: MarketingSiteHeaderDesktopBarProps) {
  const locale = useLocale();
  const compact = isCompactMarketingHeaderLocale(locale);
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tUi = useTranslations("marketingUi");

  return (
    <div
      className={`${marketingHeaderDesktopRowClass()} ${navPillStyles.desktopUnifiedBar} ${navPillStyles.marketingGlassPill}`}
      data-glass-active="true"
      style={desktopGlassStyle}
    >
      <div aria-hidden className={navPillStyles.marketingGlassPillGloss} />
      <Link
        href="/"
        className={marketingHeaderDesktopBrandLinkClass()}
        onClick={onBrandClick}
      >
        <span className={marketingHeaderDesktopBrandTextClass()}>
          {tNav("studioBrand")}
        </span>
      </Link>

      <nav className={marketingHeaderDesktopNavClass()} aria-label={tUi("primaryNavAria")}>
        <div className={`${marketingHeaderNavLinksClass(compact)} ${navPillStyles.desktopNavLinks}`}>
          {navLinks.map(({ href, key }) => {
            const linkActive = isMarketingNavLinkActive(marketingPath, href, key);
            return (
              <Link
                key={href}
                href={href}
                className={`${marketingHeaderNavPillLinkClass(linkActive, compact)} ${navPillStyles.desktopNavLink} ${linkActive ? navPillStyles.desktopNavLinkActive : ""}`}
                aria-current={linkActive ? "page" : undefined}
              >
                <span
                  className={`${navPillStyles.desktopNavLinkText} ${linkActive ? navPillStyles.desktopNavLinkTextActive : ""}`}
                >
                  {tNav(key)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className={marketingHeaderDesktopActionsClass()}>
        <div className={marketingHeaderAuthClusterClass()}>
          <LanguageSwitcher
            context="marketing"
            appearance="icon"
            className="min-w-0 shrink-0"
            triggerClassName={marketingHeaderLanguageTriggerClass()}
            onAfterSelect={onCloseAllMenus}
            renderIconTrigger={() => (
              <MarketingHeaderGlobeIcon className={MARKETING_HEADER_DESKTOP_ACTION_ICON_CLASS} />
            )}
          />
          {sessionReviewsAudience && sessionReviewsListHref ? (
            <HeaderSessionReviewsMenu
              audience={sessionReviewsAudience}
              viewAllHref={sessionReviewsListHref}
              triggerClassName={desktopNotificationsTriggerClass}
              iconClassName={MARKETING_HEADER_DESKTOP_ACTION_ICON_CLASS}
              onNavigate={onCloseAllMenus}
            />
          ) : null}
          {callTasksListHref ? (
            <HeaderCallTasksMenu
              enabled
              listHref={callTasksListHref}
              triggerClassName={desktopNotificationsTriggerClass}
              iconClassName={MARKETING_HEADER_DESKTOP_ACTION_ICON_CLASS}
              onNavigate={onCloseAllMenus}
            />
          ) : showNotifications ? (
            <HeaderNotificationsMenu
              enabled
              preferencesHref={notificationPreferencesHref}
              triggerClassName={desktopNotificationsTriggerClass}
              iconClassName={MARKETING_HEADER_DESKTOP_ACTION_ICON_CLASS}
              onNavigate={onCloseAllMenus}
            />
          ) : null}
          {account ? (
            <MarketingAccountAvatarMenu
              initials={account.initials}
              imageSrc={account.imageSrc}
              displayName={account.displayName}
              profileHref={memberWorkspaceHeader ? memberAvatarProfileHref : account.href}
              hardNavigate={memberWorkspaceHeader}
              triggerClassName={marketingHeaderIconAccountClass()}
              avatarClassName={`${MARKETING_HEADER_DESKTOP_AVATAR_CLASS} rounded-full`}
              guestIconClassName={MARKETING_HEADER_GUEST_USER_ICON_CLASS}
              onAfterSelect={onCloseAllMenus}
            />
          ) : !memberWorkspaceHeader ? (
            <MarketingHeaderLoginLink
              className={marketingHeaderIconAccountClass()}
              ariaLabel={tCommon("login")}
              onNavigate={onCloseAllMenus}
            >
              <MarketingHeaderUserIcon className={MARKETING_HEADER_GUEST_USER_ICON_CLASS} />
            </MarketingHeaderLoginLink>
          ) : (
            <Link
              href={USER_ACCOUNT_PATH}
              className={marketingHeaderIconAccountClass()}
              aria-label={tCommon("login")}
              onClick={onCloseAllMenus}
            >
              <MarketingHeaderUserIcon className={MARKETING_HEADER_GUEST_USER_ICON_CLASS} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export { marketingHeaderNotificationTriggerClass };
