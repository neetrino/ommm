"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, type MouseEvent } from "react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import {
  MarketingHeaderGlobeIcon,
  MarketingHeaderMenuIcon,
  MarketingHeaderUserIcon,
} from "@/components/marketing/marketing-header-icons";
import type { MarketingNavKey } from "@/components/marketing/marketing-nav-links";
import { MarketingMobileMenuModal } from "@/components/marketing/marketing-mobile-menu-modal";
import { MarketingAccountAvatarMenu } from "@/components/marketing/marketing-account-avatar-menu";
import {
  isCompactMarketingHeaderLocale,
  marketingHeaderAuthClusterClass,
  marketingHeaderContainerClass,
  marketingHeaderDesktopActionsClass,
  marketingHeaderDesktopBrandLinkClass,
  marketingHeaderDesktopBrandTextClass,
  marketingHeaderDesktopNavClass,
  marketingHeaderDesktopRowClass,
  marketingHeaderIconAccountClass,
  marketingHeaderIconButtonClass,
  marketingHeaderLanguageTriggerClass,
  marketingHeaderMobileActionsClass,
  marketingHeaderMobileBrandLinkClass,
  marketingHeaderMobileBrandTextClass,
  marketingHeaderMobileIconAccountClass,
  marketingHeaderMobileLanguageTriggerClass,
  marketingHeaderMobileMenuButtonClass,
  marketingHeaderMobileRowInnerClass,
  marketingHeaderMobileRowWrapClass,
  marketingHeaderMobileRowWrapStyle,
  MARKETING_MOBILE_HEADER,
  marketingHeaderNavLinksClass,
  marketingHeaderNavPillLinkClass,
  marketingHeaderShellClass,
} from "@/components/marketing/marketing-site-header-layout";
import navPillStyles from "@/components/marketing/marketing-site-header-nav-pill.module.css";
import { useMarketingHeaderElevated } from "@/hooks/use-marketing-header-elevated";
import {
  isAuthPath,
  isMarketingHeroHeaderPath,
  isMarketingHomePath,
  isUserAccountPath,
} from "@/components/marketing/marketing-route-utils";
import { WorkspaceShellNotificationLink } from "@/components/shell/workspace-shell-notification-link";
import { workspaceMobileDrawerLayout } from "@/components/shell/workspace-mobile-drawer-layout";
import { Link, usePathname } from "@/i18n/navigation";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
  /** Member workspace — hide language switcher and avatar in the header action cluster. */
  memberWorkspaceHeader?: boolean;
  notificationHref?: string | null;
  notificationsLabel?: string | null;
  notificationsActive?: boolean;
};

function WorkspaceDrawerGlyph() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function HeaderNotificationAction({
  href,
  label,
  active,
  className,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <WorkspaceShellNotificationLink
      href={href}
      label={label}
      active={active}
      className={className}
      onNavigate={onNavigate}
    />
  );
}

/** Global site header — same chrome on marketing pages and authenticated workspaces. */
export function MarketingSiteHeader({
  navLinks,
  account = null,
  workspaceDrawer,
  workspaceHeaderChrome = false,
  memberWorkspaceHeader = false,
  notificationHref = null,
  notificationsLabel = null,
  notificationsActive = false,
}: MarketingSiteHeaderProps) {
  const locale = useLocale();
  const compact = isCompactMarketingHeaderLocale(locale);
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tUi = useTranslations("marketingUi");
  const tShell = useTranslations("dashboard.shell");
  const pathname = usePathname();
  const [publicMenuOpen, setPublicMenuOpen] = useState(false);
  const marketingPath = pathname ?? "";
  const isMarketingHome = isMarketingHomePath(marketingPath);
  const isWorkspaceChrome = workspaceHeaderChrome || workspaceDrawer !== undefined;
  const isAuthShell = isAuthPath(marketingPath);
  const isAccountShell =
    isWorkspaceChrome || isUserAccountPath(marketingPath) || isAuthShell;
  const scrollElevated = useMarketingHeaderElevated(
    !isWorkspaceChrome &&
      !isAuthShell &&
      isMarketingHeroHeaderPath(marketingPath),
  );
  const elevated = isWorkspaceChrome ? true : scrollElevated;
  const workspaceDrawerOpen = workspaceDrawer?.open ?? false;
  const anyOverlayOpen = publicMenuOpen || workspaceDrawerOpen;
  const showMobileGlassPill = elevated && !anyOverlayOpen;
  const mobileGlassRowStyle = {
    ...marketingHeaderMobileRowWrapStyle(showMobileGlassPill),
    ["--marketing-mobile-scrolled-pill-bg" as string]:
      MARKETING_MOBILE_HEADER.scrolledPillBackground,
  };
  const showNotifications =
    notificationHref !== null && notificationsLabel !== null;
  const desktopGlassStyle = {
    ["--marketing-glass-pill-bg" as string]:
      MARKETING_MOBILE_HEADER.scrolledPillBackground,
  };

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
          <div className={`${marketingHeaderMobileRowInnerClass()} ${navPillStyles.mobileHeaderRow}`}>
            <button
              type="button"
              className={`${marketingHeaderMobileMenuButtonClass(publicMenuOpen)} ${navPillStyles.mobileHeaderMenuButton}`}
              aria-expanded={publicMenuOpen}
              aria-controls="marketing-mobile-nav"
              aria-label={publicMenuOpen ? tUi("closeMenu") : tUi("openMenu")}
              onClick={() => setPublicMenuOpen((open) => !open)}
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

            <Link href="/" className={marketingHeaderMobileBrandLinkClass()} onClick={handleBrandClick}>
              <span
                className={`${marketingHeaderMobileBrandTextClass()} ${navPillStyles.mobileHeaderBrandText}`}
              >
                {tNav("spaceBrand")}
              </span>
            </Link>

            <div className={marketingHeaderMobileActionsClass()}>
              {workspaceDrawer ? (
                <button
                  type="button"
                  className={`${marketingHeaderIconButtonClass()} ${navPillStyles.mobileHeaderAccountButton} ${workspaceMobileDrawerLayout.mobileDrawerTrigger}`}
                  aria-expanded={workspaceDrawerOpen}
                  aria-controls="dashboard-mobile-drawer"
                  aria-label={
                    workspaceDrawerOpen ? tShell("closeMenu") : tShell("openMenu")
                  }
                  onClick={workspaceDrawer.onToggle}
                >
                  <WorkspaceDrawerGlyph />
                  <span className="sr-only">{tShell("workspaceAria")}</span>
                </button>
              ) : null}
              {showNotifications ? (
                <HeaderNotificationAction
                  href={notificationHref}
                  label={notificationsLabel}
                  active={notificationsActive}
                  className={`${navPillStyles.mobileHeaderAccountButton} ${workspaceMobileDrawerLayout.mobileDrawerTrigger}`}
                  onNavigate={closeAllMenus}
                />
              ) : null}
              {!memberWorkspaceHeader ? (
                <LanguageSwitcher
                  context="marketing"
                  appearance="icon"
                  className="min-w-0 shrink-0"
                  triggerClassName={`${marketingHeaderMobileLanguageTriggerClass()} ${navPillStyles.mobileHeaderLanguageTrigger}`}
                  onAfterSelect={closeAllMenus}
                  renderIconTrigger={() => (
                    <MarketingHeaderGlobeIcon
                      className={`${navPillStyles.mobileHeaderActionIcon} shrink-0`}
                    />
                  )}
                />
              ) : null}
              {!memberWorkspaceHeader && account ? (
                <MarketingAccountAvatarMenu
                  initials={account.initials}
                  imageSrc={account.imageSrc}
                  displayName={account.displayName}
                  profileHref={account.href}
                  triggerClassName={`${marketingHeaderMobileIconAccountClass()} ${navPillStyles.mobileHeaderAccountButton}`}
                  avatarClassName={navPillStyles.mobileHeaderAvatar}
                  onAfterSelect={closeAllMenus}
                />
              ) : !memberWorkspaceHeader ? (
                <Link
                  href="/login"
                  className={`${marketingHeaderMobileIconAccountClass()} ${navPillStyles.mobileHeaderAccountButton}`}
                  aria-label={tCommon("login")}
                  onClick={closeAllMenus}
                >
                  <MarketingHeaderUserIcon
                    className={`${navPillStyles.mobileHeaderActionIcon} shrink-0`}
                  />
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className={`${marketingHeaderDesktopRowClass()} ${navPillStyles.desktopUnifiedBar} ${navPillStyles.marketingGlassPill}`}
          data-glass-active="true"
          style={desktopGlassStyle}
        >
          <div aria-hidden className={navPillStyles.marketingGlassPillGloss} />
          <Link
            href="/"
            className={marketingHeaderDesktopBrandLinkClass()}
            onClick={handleBrandClick}
          >
            <span className={marketingHeaderDesktopBrandTextClass()}>
              {tNav("studioBrand")}
            </span>
          </Link>

          <nav
            className={marketingHeaderDesktopNavClass()}
            aria-label={tUi("primaryNavAria")}
          >
            <div className={`${marketingHeaderNavLinksClass(compact)} ${navPillStyles.desktopNavLinks}`}>
              {navLinks.map(({ href, key }) => {
                const linkActive = isActive(marketingPath, href);
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
              {showNotifications ? (
                <HeaderNotificationAction
                  href={notificationHref}
                  label={notificationsLabel}
                  active={notificationsActive}
                  className="hidden h-8 w-8 min-h-8 min-w-8 lg:inline-flex lg:h-9 lg:w-9 lg:min-h-9 lg:min-w-9 nav-desktop:h-8 nav-desktop:w-8 nav-desktop:min-h-8 nav-desktop:min-w-8"
                  onNavigate={closeAllMenus}
                />
              ) : null}
              {!memberWorkspaceHeader ? (
                <LanguageSwitcher
                  context="marketing"
                  appearance="icon"
                  className="min-w-0 shrink-0"
                  triggerClassName={marketingHeaderLanguageTriggerClass()}
                  onAfterSelect={closeAllMenus}
                  renderIconTrigger={() => (
                    <MarketingHeaderGlobeIcon className="h-6 w-6 shrink-0 lg:h-7 lg:w-7 nav-desktop:h-8 nav-desktop:w-8" />
                  )}
                />
              ) : null}
              {!memberWorkspaceHeader && account ? (
                <MarketingAccountAvatarMenu
                  initials={account.initials}
                  imageSrc={account.imageSrc}
                  displayName={account.displayName}
                  profileHref={account.href}
                  triggerClassName={marketingHeaderIconAccountClass()}
                  avatarClassName={navPillStyles.desktopHeaderAvatar}
                  onAfterSelect={closeAllMenus}
                />
              ) : !memberWorkspaceHeader ? (
                <Link
                  href="/login"
                  className={marketingHeaderIconAccountClass()}
                  aria-label={tCommon("login")}
                  onClick={closeAllMenus}
                >
                  <MarketingHeaderUserIcon className="h-5 w-5 shrink-0 lg:h-6 lg:w-6 nav-desktop:h-7 nav-desktop:w-7" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {publicMenuOpen ? (
        <MarketingMobileMenuModal
          isOpen={publicMenuOpen}
          onClose={() => setPublicMenuOpen(false)}
          navLinks={navLinks}
          marketingPath={marketingPath}
          isActive={isActive}
        />
      ) : null}
    </header>
  );
}
