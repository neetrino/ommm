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
import {
  isCompactMarketingHeaderLocale,
  marketingHeaderActionsClass,
  marketingHeaderAuthClusterClass,
  marketingHeaderBrandLinkClass,
  marketingHeaderBrandTextClass,
  marketingHeaderContainerClass,
  marketingHeaderIconAccountClass,
  marketingHeaderLanguageTriggerClass,
  marketingHeaderMobileActionsClass,
  marketingHeaderMobileBrandLinkClass,
  marketingHeaderMobileBrandTextClass,
  marketingHeaderMobileIconAccountClass,
  marketingHeaderMobileLanguageTriggerClass,
  marketingHeaderMobileMenuButtonClass,
  marketingHeaderMobileRowClass,
  marketingHeaderNavClass,
  marketingHeaderNavLinksClass,
  marketingHeaderNavPillLinkClass,
  marketingHeaderShellClass,
} from "@/components/marketing/marketing-site-header-layout";
import navPillStyles from "@/components/marketing/marketing-site-header-nav-pill.module.css";
import { useMarketingHeaderElevated } from "@/components/marketing/use-marketing-header-elevated";
import {
  isMarketingHeroHeaderPath,
  isMarketingHomePath,
} from "@/components/marketing/marketing-route-utils";
import { Link, usePathname } from "@/i18n/navigation";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type MarketingSiteHeaderProps = {
  navLinks: readonly { readonly href: string; readonly key: MarketingNavKey }[];
};

/** Public marketing header — desktop Figma `196:1404`; mobile HEADER `97:5670`. */
export function MarketingSiteHeader({ navLinks }: MarketingSiteHeaderProps) {
  const locale = useLocale();
  const compact = isCompactMarketingHeaderLocale(locale);
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tUi = useTranslations("marketingUi");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const marketingPath = pathname ?? "";
  const isMarketingHome = isMarketingHomePath(marketingPath);
  const elevated = useMarketingHeaderElevated(isMarketingHeroHeaderPath(marketingPath));
  const pillSurfaceClass = elevated ? navPillStyles.pillElevated : navPillStyles.pillHero;

  function handleBrandClick(event: MouseEvent<HTMLAnchorElement>) {
    setOpen(false);
    if (!isMarketingHome) {
      return;
    }
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <header
      className={`${marketingHeaderShellClass()} ${navPillStyles.headerShell}`}
      data-elevated={elevated ? "true" : "false"}
      data-menu-open={open ? "true" : "false"}
    >
      <div className={marketingHeaderContainerClass()}>
        <div className={marketingHeaderMobileRowClass()}>
          <button
            type="button"
            className={marketingHeaderMobileMenuButtonClass(open)}
            aria-expanded={open}
            aria-controls="marketing-mobile-nav"
            aria-label={open ? tUi("closeMenu") : tUi("openMenu")}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{tUi("menuSr")}</span>
            {open ? (
              <svg
                className="h-[35px] w-[35px]"
                viewBox="0 0 35 35"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                aria-hidden
              >
                <path d="M10 10l15 15M25 10L10 25" strokeLinecap="round" />
              </svg>
            ) : (
              <MarketingHeaderMenuIcon className="h-[35px] w-[35px] shrink-0" />
            )}
          </button>

          <Link
            href="/"
            className={marketingHeaderMobileBrandLinkClass()}
            onClick={handleBrandClick}
          >
            <span className={marketingHeaderMobileBrandTextClass()}>
              {tNav("spaceBrand")}
            </span>
          </Link>

          <div className={marketingHeaderMobileActionsClass()}>
            <LanguageSwitcher
              context="marketing"
              appearance="icon"
              className="min-w-0 shrink-0"
              triggerClassName={marketingHeaderMobileLanguageTriggerClass()}
              onAfterSelect={() => setOpen(false)}
              renderIconTrigger={() => (
                <MarketingHeaderGlobeIcon className="h-[26px] w-[26px] shrink-0" />
              )}
            />
            <Link
              href="/login"
              className={marketingHeaderMobileIconAccountClass()}
              aria-label={tCommon("login")}
              onClick={() => setOpen(false)}
            >
              <MarketingHeaderUserIcon className="h-6 w-6 shrink-0" />
            </Link>
          </div>
        </div>

        <Link
          href="/"
          className={marketingHeaderBrandLinkClass()}
          onClick={handleBrandClick}
        >
          <span className={marketingHeaderBrandTextClass()}>
            {tNav("studioBrand")}
          </span>
        </Link>

        <nav
          className={`${marketingHeaderNavClass(compact)} ${navPillStyles.pill} ${pillSurfaceClass}`}
          aria-label={tUi("primaryNavAria")}
          data-elevated={elevated ? "true" : "false"}
        >
          <div aria-hidden className={navPillStyles.gloss} />
          <div className={marketingHeaderNavLinksClass(compact)}>
            {navLinks.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className={marketingHeaderNavPillLinkClass(
                  isActive(marketingPath, href),
                  compact,
                )}
              >
                {tNav(key)}
              </Link>
            ))}
          </div>
        </nav>

        <div className={marketingHeaderActionsClass()}>
          <div className={marketingHeaderAuthClusterClass()}>
            <LanguageSwitcher
              context="marketing"
              appearance="icon"
              className="min-w-0 shrink-0"
              triggerClassName={marketingHeaderLanguageTriggerClass()}
              onAfterSelect={() => setOpen(false)}
              renderIconTrigger={() => (
                <MarketingHeaderGlobeIcon className="h-6 w-6 shrink-0 lg:h-7 lg:w-7 nav-desktop:h-8 nav-desktop:w-8" />
              )}
            />
            <Link
              href="/login"
              className={marketingHeaderIconAccountClass()}
              aria-label={tCommon("login")}
              onClick={() => setOpen(false)}
            >
              <MarketingHeaderUserIcon className="h-[22px] w-[20px] shrink-0 lg:h-[26px] lg:w-[23px] nav-desktop:h-[29px] nav-desktop:w-[26px]" />
            </Link>
          </div>
        </div>
      </div>

      <MarketingMobileMenuModal
        isOpen={open}
        onClose={() => setOpen(false)}
        navLinks={navLinks}
        marketingPath={marketingPath}
        isActive={isActive}
      />
    </header>
  );
}
