"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Link, usePathname } from "@/i18n/navigation";
import type { MarketingNavKey } from "@/components/marketing/marketing-nav-links";

function navLinkClass(active: boolean, home: boolean): string {
  if (home) {
    return [
      "rounded-full px-3 py-2 text-base font-light transition-colors",
      active
        ? "border-b-2 border-[rgba(250,204,21,0.5)] pb-1.5 text-white"
        : "text-white hover:bg-white/10",
    ].join(" ");
  }
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
  const isMarketingHome = pathname === "/" || pathname === "";

  return (
    <header
      className={
        isMarketingHome
          ? "sticky top-0 z-50 border-b border-white/20 bg-transparent backdrop-blur-[12px]"
          : "sticky top-0 z-50 border-b border-white/40 bg-white/55 backdrop-blur-xl"
      }
    >
      <div className="ommm-container flex h-16 items-center justify-between gap-4 sm:h-20">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          onClick={() => setOpen(false)}
        >
          {isMarketingHome ? (
            <span className="font-sans text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {tNav("studioBrand")}
            </span>
          ) : (
            <Image
              src="/marketing/home/brand-mark.png"
              alt=""
              width={104}
              height={104}
              className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24"
              priority
            />
          )}
        </Link>

        <nav
          className="hidden items-center gap-10 lg:flex"
          aria-label={tUi("primaryNavAria")}
        >
          {navLinks.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className={navLinkClass(isActive(pathname, href), isMarketingHome)}
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
          {isMarketingHome ? (
            <Link
              href="/schedule"
              className="hidden rounded-full bg-[#e8da74] px-8 py-3 text-sm font-medium text-white shadow-sm transition-[filter,transform] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent lg:inline-flex"
            >
              {tUi("bookAClass")}
            </Link>
          ) : (
            <div className="hidden items-center gap-3 lg:flex">
              <Link href="/login" className="ommm-cta-ghost">
                {tCommon("login")}
              </Link>
              <Link href="/register" className="ommm-cta-primary">
                {tCommon("register")}
              </Link>
            </div>
          )}
          <button
            type="button"
            className={
              isMarketingHome
                ? "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-white/10 text-white shadow-sm lg:hidden"
                : "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-sage-700 shadow-sm lg:hidden"
            }
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
            ? isMarketingHome
              ? "border-t border-white/30 bg-black/30 px-4 py-4 backdrop-blur-xl lg:hidden"
              : "border-t border-white/50 bg-white/85 px-4 py-4 backdrop-blur-xl lg:hidden"
            : "hidden"
        }
      >
        <nav className="flex flex-col gap-1" aria-label={tUi("mobilePrimaryNavAria")}>
          {navLinks.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className={navLinkClass(isActive(pathname, href), isMarketingHome)}
              onClick={() => setOpen(false)}
            >
              {tNav(key)}
            </Link>
          ))}
        </nav>
        <div className="mt-4 flex flex-col gap-2 border-t border-white/60 pt-4">
          {isMarketingHome ? (
            <>
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
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}
