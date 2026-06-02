"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
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
  marketingHeaderNavPillGlossClass,
  marketingHeaderShellClass,
} from "@/components/marketing/marketing-site-header-layout";
import navPillStyles from "@/components/marketing/marketing-site-header-nav-pill.module.css";
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

  return (
    <header className={marketingHeaderShellClass()}>
      <div className={marketingHeaderContainerClass()}>
        <Link
          href="/"
          className={marketingHeaderBrandLinkClass()}
          onClick={() => setOpen(false)}
        >
          <span className={marketingHeaderBrandTextClass()}>
            {tNav("studioBrand")}
          </span>
        </Link>

        <nav
          className={`${marketingHeaderNavClass(compact)} ${navPillStyles.pill}`}
          aria-label={tUi("primaryNavAria")}
        >
          <div
            aria-hidden
            className={`${marketingHeaderNavPillGlossClass()} ${navPillStyles.gloss}`}
          />
          <div className={marketingHeaderNavLinksClass(compact)}>
            {navLinks.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className={marketingHeaderNavLinkClass(
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
            className={marketingHeaderMenuButtonClass()}
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
        className={marketingHeaderMobilePanelClass(open)}
      >
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
        <div className="mt-4 flex flex-col gap-2 border-t border-white/60 pt-4">
          <Link
            href="/schedule"
            className="inline-flex w-full items-center justify-center rounded-full bg-[#e8da74] px-5 py-3 text-sm font-medium text-white"
            onClick={() => setOpen(false)}
          >
            {tUi("bookAClass")}
          </Link>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-full border border-white/50 px-5 py-3 text-sm font-medium text-white"
            onClick={() => setOpen(false)}
          >
            {tCommon("login")}
          </Link>
        </div>
      </div>
    </header>
  );
}
