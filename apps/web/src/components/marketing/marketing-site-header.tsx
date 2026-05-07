"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";

function navLinkClass(active: boolean) {
  return [
    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-zinc-100 text-zinc-900"
      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
  ].join(" ");
}

export function MarketingSiteHeader() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", key: "home" as const },
    { href: "/story", key: "story" as const },
    { href: "/coaches", key: "coaches" as const },
    { href: "/memberships", key: "memberships" as const },
    { href: "/explore", key: "explore" as const },
    { href: "/contact", key: "contact" as const },
  ];

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:h-16">
        <Link
          href="/"
          className="shrink-0 text-base font-semibold tracking-tight text-zinc-900 sm:text-lg"
          onClick={() => setOpen(false)}
        >
          Ommm
        </Link>

        <nav
          className="hidden items-center gap-0.5 md:flex"
          aria-label="Primary"
        >
          {links.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className={navLinkClass(isActive(href))}
            >
              {tNav(key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 sm:text-sm"
          >
            {tCommon("login")}
          </Link>
          <Link
            href="/account"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-800 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 sm:text-sm"
          >
            {tCommon("account")}
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-800 shadow-sm md:hidden"
          aria-expanded={open}
          aria-controls="marketing-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
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

      <div
        id="marketing-mobile-nav"
        className={
          open
            ? "border-t border-zinc-200 bg-white px-4 py-4 md:hidden"
            : "hidden"
        }
      >
        <nav className="flex flex-col gap-1" aria-label="Mobile primary">
          {links.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className={navLinkClass(isActive(href))}
              onClick={() => setOpen(false)}
            >
              {tNav(key)}
            </Link>
          ))}
        </nav>
        <div className="mt-4 flex flex-col gap-2 border-t border-zinc-100 pt-4">
          <Link
            href="/login"
            className="app-btn-primary w-full text-center"
            onClick={() => setOpen(false)}
          >
            {tCommon("login")}
          </Link>
          <Link
            href="/account"
            className="app-btn-secondary w-full text-center"
            onClick={() => setOpen(false)}
          >
            {tCommon("account")}
          </Link>
        </div>
      </div>
    </header>
  );
}
