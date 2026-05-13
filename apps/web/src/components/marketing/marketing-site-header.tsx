"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Link, usePathname } from "@/i18n/navigation";
import type { MarketingNavKey } from "@/components/marketing/marketing-nav-links";

function navLinkClass(active: boolean): string {
  return [
    "rounded-full px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-white/70 text-sage-900"
      : "text-sage-700 hover:bg-white/50 hover:text-sage-900",
  ].join(" ");
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type MarketingSiteHeaderProps = {
  navLinks: readonly { readonly href: string; readonly key: MarketingNavKey }[];
};

export function MarketingSiteHeader({ navLinks }: MarketingSiteHeaderProps) {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tUi = useTranslations("marketingUi");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/55 backdrop-blur-xl">
      <div className="ommm-container flex h-16 items-center justify-between gap-4 sm:h-20">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <span className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-sand-500/20 ring-1 ring-white/70 sm:h-12 sm:w-12">
            <Image
              src="/marketing/home/brand-mark.png"
              alt=""
              width={56}
              height={56}
              className="h-full w-full object-cover"
              priority
            />
          </span>
          <span className="font-serif text-lg font-medium tracking-tight text-sage-700 sm:text-xl">
            Ommm
          </span>
        </Link>

        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label={tUi("primaryNavAria")}
        >
          {navLinks.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className={navLinkClass(isActive(pathname, href))}
            >
              {tNav(key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 lg:ml-0">
          <LanguageSwitcher
            context="marketing"
            onAfterSelect={() => setOpen(false)}
          />
          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/login" className="ommm-cta-ghost">
              {tCommon("login")}
            </Link>
            <Link href="/register" className="ommm-cta-primary">
              {tCommon("register")}
            </Link>
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-sage-700 shadow-sm lg:hidden"
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
        className={
          open
            ? "border-t border-white/50 bg-white/85 px-4 py-4 backdrop-blur-xl lg:hidden"
            : "hidden"
        }
      >
        <nav className="flex flex-col gap-1" aria-label={tUi("mobilePrimaryNavAria")}>
          {navLinks.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className={navLinkClass(isActive(pathname, href))}
              onClick={() => setOpen(false)}
            >
              {tNav(key)}
            </Link>
          ))}
        </nav>
        <div className="mt-4 flex flex-col gap-2 border-t border-white/60 pt-4">
          <Link
            href="/register"
            className="ommm-cta-primary w-full"
            onClick={() => setOpen(false)}
          >
            {tCommon("register")}
          </Link>
          <Link
            href="/login"
            className="ommm-cta-ghost w-full"
            onClick={() => setOpen(false)}
          >
            {tCommon("login")}
          </Link>
        </div>
      </div>
    </header>
  );
}
