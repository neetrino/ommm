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
  marketingHeaderActionsClass,
  marketingHeaderAuthClusterClass,
  marketingHeaderBrandLinkClass,
  marketingHeaderBrandTextClass,
  marketingHeaderContainerClass,
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
  marketingHeaderNavClass,
  marketingHeaderNavLinksClass,
  marketingHeaderNavPillLinkClass,
  marketingHeaderShellClass,
} from "@/components/marketing/marketing-site-header-layout";
import navPillStyles from "@/components/marketing/marketing-site-header-nav-pill.module.css";
import { useMarketingHeaderElevated } from "@/components/marketing/use-marketing-header-elevated";
import {
  isAuthPath,
  isMarketingHeroHeaderPath,
  isMarketingHomePath,
  isUserAccountPath,
} from "@/components/marketing/marketing-route-utils";
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

/** Global site header — same chrome on marketing pages and authenticated workspaces. */
export function MarketingSiteHeader({
  navLinks,
  account = null,
  workspaceDrawer,
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
  const isWorkspaceChrome = workspaceDrawer !== undefined;
  const isAuthShell = isAuthPath(marketingPath);
  const isAccountShell =
    isWorkspaceChrome || isUserAccountPath(marketingPath) || isAuthShell;
  const scrollElevated = useMarketingHeaderElevated(
    !isWorkspaceChrome &&
      !isAuthShell &&
      isMarketingHeroHeaderPath(marketingPath),
  );
  const elevated = isWorkspaceChrome ? true : scrollElevated;
  const pillSurfaceClass = elevated ? navPillStyles.pillElevated : navPillStyles.pillHero;
  const workspaceDrawerOpen = workspaceDrawer?.open ?? false;
  const anyOverlayOpen = publicMenuOpen || workspaceDrawerOpen;
  const showMobileGlassPill = elevated && !anyOverlayOpen;
  const mobileGlassRowStyle = {
    ...marketingHeaderMobileRowWrapStyle(showMobileGlassPill),
    ["--marketing-mobile-scrolled-pill-bg" as string]:
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
                  className={`${marketingHeaderIconButtonClass()} ${navPillStyles.mobileHeaderAccountButton} lg:hidden`}
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
              {account ? (
                <MarketingAccountAvatarMenu
                  initials={account.initials}
                  imageSrc={account.imageSrc}
                  displayName={account.displayName}
                  profileHref={account.href}
                  triggerClassName={`${marketingHeaderMobileIconAccountClass()} ${navPillStyles.mobileHeaderAccountButton}`}
                  onAfterSelect={closeAllMenus}
                />
              ) : (
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
              )}
            </div>
          </div>
        </div>

        <Link href="/" className={marketingHeaderBrandLinkClass()} onClick={handleBrandClick}>
          <span className={marketingHeaderBrandTextClass()}>{tNav("studioBrand")}</span>
        </Link>

        <nav
          className={`${marketingHeaderNavClass(compact)} ${navPillStyles.pill} ${pillSurfaceClass}`}
          aria-label={tUi("primaryNavAria")}
          data-elevated={elevated ? "true" : "false"}
        >
          <div aria-hidden className={navPillStyles.gloss} />
          <div className={`${marketingHeaderNavLinksClass(compact)} ${navPillStyles.desktopNavLinks}`}>
            {navLinks.map(({ href, key }) => {
              const linkActive = isActive(marketingPath, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${marketingHeaderNavPillLinkClass(linkActive, compact)} ${navPillStyles.desktopNavLink}`}
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

        <div className={marketingHeaderActionsClass()}>
          <div className={marketingHeaderAuthClusterClass()}>
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
            {account ? (
              <MarketingAccountAvatarMenu
                initials={account.initials}
                imageSrc={account.imageSrc}
                displayName={account.displayName}
                profileHref={account.href}
                triggerClassName={marketingHeaderIconAccountClass()}
                onAfterSelect={closeAllMenus}
              />
            ) : (
              <Link
                href="/login"
                className={marketingHeaderIconAccountClass()}
                aria-label={tCommon("login")}
                onClick={closeAllMenus}
              >
                <MarketingHeaderUserIcon className="h-[22px] w-[20px] shrink-0 lg:h-[26px] lg:w-[23px] nav-desktop:h-[29px] nav-desktop:w-[26px]" />
              </Link>
            )}
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
