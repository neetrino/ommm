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
  marketingHeaderMobilePanelClass,
  marketingHeaderMobileRowClass,
  marketingHeaderNavClass,
  marketingHeaderNavLinkClass,
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
    >
      <div className={marketingHeaderContainerClass()}>
        <div className={marketingHeaderMobileRowClass()}>
          <button
            type="button"
            className={marketingHeaderMobileMenuButtonClass()}
            aria-expanded={open}
            aria-controls="marketing-mobile-nav"
            aria-label={open ? tUi("closeMenu") : tUi("openMenu")}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{tUi("menuSr")}</span>
            {open ? (
              <svg
                width="35"
                height="35"
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
                <MarketingHeaderGlobeIcon className="h-8 w-8 shrink-0" />
              )}
            />
            <Link
              href="/login"
              className={marketingHeaderIconAccountClass()}
              aria-label={tCommon("login")}
              onClick={() => setOpen(false)}
            >
              <MarketingHeaderUserIcon className="h-[29px] w-[26px] shrink-0" />
            </Link>
          </div>
        </div>
      </div>

      <div
        id="marketing-mobile-nav"
        className={`${marketingHeaderMobilePanelClass(open)} ${open ? navPillStyles.mobilePanel : ""}`}
      >
        <div className={navPillStyles.mobilePanelContent}>
          <nav
            className="flex flex-col gap-1"
            aria-label={tUi("mobilePrimaryNavAria")}
          >
            {navLinks.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className={marketingHeaderNavLinkClass(
                  isActive(marketingPath, href),
                  compact,
                )}
                onClick={() => setOpen(false)}
              >
                {tNav(key)}
              </Link>
            ))}
          </nav>
          <div className={`flex flex-col gap-2 ${navPillStyles.mobileDivider}`}>
            <LanguageSwitcher
              context="marketing"
              className="w-full"
              onAfterSelect={() => setOpen(false)}
            />
            <Link
              href="/schedule"
              className={navPillStyles.mobileCtaPrimary}
              onClick={() => setOpen(false)}
            >
              {tUi("bookAClass")}
            </Link>
            <Link
              href="/login"
              className={navPillStyles.mobileCtaSecondary}
              onClick={() => setOpen(false)}
            >
              {tCommon("login")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
