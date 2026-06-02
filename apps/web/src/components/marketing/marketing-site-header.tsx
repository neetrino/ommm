"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, type MouseEvent } from "react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import {
  MarketingHeaderGlobeIcon,
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
  marketingHeaderMenuButtonClass,
  marketingHeaderMobilePanelClass,
  marketingHeaderNavClass,
  marketingHeaderNavLinkClass,
  marketingHeaderNavLinksClass,
  marketingHeaderNavPillLinkClass,
  marketingHeaderShellClass,
} from "@/components/marketing/marketing-site-header-layout";
import navPillStyles from "@/components/marketing/marketing-site-header-nav-pill.module.css";
import { useMarketingHeaderElevated } from "@/components/marketing/use-marketing-header-elevated";
import { Link, usePathname } from "@/i18n/navigation";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type MarketingSiteHeaderProps = {
  navLinks: readonly { readonly href: string; readonly key: MarketingNavKey }[];
};

/** Public marketing header — Figma hero `196:1404` (wordmark, TopNavBar pill, globe, user). */
export function MarketingSiteHeader({ navLinks }: MarketingSiteHeaderProps) {
  const locale = useLocale();
  const compact = isCompactMarketingHeaderLocale(locale);
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tUi = useTranslations("marketingUi");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const marketingPath = pathname ?? "";
  const isMarketingHome = marketingPath === "/" || marketingPath === "";
  const elevated = useMarketingHeaderElevated(isMarketingHome);
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
          <button
            type="button"
            className={`${marketingHeaderMenuButtonClass()} ${navPillStyles.menuButton}`}
            aria-expanded={open}
            aria-controls="marketing-mobile-nav"
            aria-label={open ? tUi("closeMenu") : tUi("openMenu")}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{tUi("menuSr")}</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </button>
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
