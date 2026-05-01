"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import {
  SITE_BRAND,
  SITE_HEADER_CTA,
  SITE_HEADER_NAV_LINKS,
} from "./constants";

const linkClassName =
  "rounded-sm px-1 py-0.5 text-sm font-medium tracking-wide text-white/95 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.75)]";

const ctaClassName =
  "inline-flex shrink-0 items-center justify-center rounded-md border border-white/70 bg-white/5 px-3 py-2 text-sm font-semibold tracking-wide text-white backdrop-blur-[2px] transition-colors hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.75)]";

function PrimaryNavLinks() {
  return (
    <>
      {SITE_HEADER_NAV_LINKS.map((item) => (
        <Link key={item.href} href={item.href} className={linkClassName}>
          {item.label}
        </Link>
      ))}
      <Link href={SITE_HEADER_CTA.href} className={ctaClassName}>
        {SITE_HEADER_CTA.label}
      </Link>
    </>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        className="size-6 text-white [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.6))]"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.75}
        stroke="currentColor"
        aria-hidden
      >
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg
      className="size-6 text-white [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.6))]"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const panelId = useId();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [menuOpen, closeMenu]);

  return (
    <header className="absolute inset-x-0 top-0 z-20 bg-transparent">
      <div className="mx-auto flex max-w-[1600px] items-start justify-between gap-3 px-4 pt-4 pb-2 sm:px-6 sm:pt-5 md:items-center md:px-8 lg:px-12">
        <Link
          href="/"
          className="min-w-0 max-w-[min(100%,14rem)] text-left text-xs font-semibold leading-snug tracking-tight text-white transition-opacity hover:opacity-90 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 sm:max-w-[min(100%,18rem)] sm:text-sm md:max-w-md md:text-base [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]"
        >
          {SITE_BRAND}
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <nav
            className="hidden flex-wrap items-center justify-end gap-x-4 gap-y-2 lg:gap-x-5 xl:flex"
            aria-label="Primary"
          >
            <PrimaryNavLinks />
          </nav>

          <nav
            className="hidden flex-wrap items-center justify-end gap-x-2 gap-y-2 sm:gap-x-3 md:flex xl:hidden"
            aria-label="Primary compact"
          >
            <PrimaryNavLinks />
          </nav>

          <button
            type="button"
            className="rounded-md p-2 md:hidden"
            aria-expanded={menuOpen}
            aria-controls={panelId}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id={panelId}
          className="border-t border-white/15 bg-black/35 backdrop-blur-md md:hidden"
        >
          <nav className="mx-auto flex max-w-[1600px] flex-col gap-1 px-4 py-3 sm:px-6">
            {SITE_HEADER_NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${linkClassName} py-2 text-base`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={SITE_HEADER_CTA.href}
              className={`${ctaClassName} mt-2 w-full text-center`}
              onClick={closeMenu}
            >
              {SITE_HEADER_CTA.label}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
