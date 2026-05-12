"use client";

import { useState, type ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";

export type ShellNavItem = { href: string; label: string };

type ShellHeaderProps = {
  brandHref: string;
  brandLabel: string;
  navItems: ShellNavItem[];
  /** Shown after nav links (e.g. logout + external link). */
  trailing?: ReactNode;
  /** Visual accent for coach vs neutral admin/account. */
  variant?: "neutral" | "indigo";
  /** Align header content with main column width. */
  contentMaxClass?: string;
};

function linkClass(active: boolean, variant: "neutral" | "indigo") {
  const base =
    "rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap";
  if (variant === "indigo") {
    return [
      base,
      active
        ? "bg-indigo-100 text-indigo-950"
        : "text-indigo-900/90 hover:bg-indigo-50 hover:text-indigo-950",
    ].join(" ");
  }
  return [
    base,
    active
      ? "bg-zinc-100 text-zinc-900"
      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
  ].join(" ");
}

export function ShellHeader({
  brandHref,
  brandLabel,
  navItems,
  trailing,
  variant = "neutral",
  contentMaxClass = "max-w-5xl",
}: ShellHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const bar =
    variant === "indigo"
      ? "border-indigo-100 bg-white"
      : "border-zinc-200 bg-white";

  /** Highlights the current section, including nested routes (e.g. `/admin/clients`). */
  function navActive(href: string) {
    if (href === "/") return pathname === "/";
    if (pathname === href) return true;
    return pathname.startsWith(`${href}/`);
  }

  return (
    <header className={`border-b ${bar}`}>
      <div
        className={`mx-auto flex h-14 w-full items-center justify-between gap-3 px-4 sm:h-16 ${contentMaxClass}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={brandHref}
            className={
              variant === "indigo"
                ? "shrink-0 font-semibold text-indigo-950"
                : "shrink-0 font-semibold text-zinc-900"
            }
            onClick={() => setOpen(false)}
          >
            {brandLabel}
          </Link>
          <nav
            className="hidden items-center gap-0.5 overflow-x-auto lg:flex"
            aria-label="Section"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(navActive(item.href), variant)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 lg:flex">{trailing}</div>

        <button
          type="button"
          className={
            variant === "indigo"
              ? "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-200 bg-white text-indigo-950 shadow-sm lg:hidden"
              : "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-800 shadow-sm lg:hidden"
          }
          aria-expanded={open}
          aria-controls="shell-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
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
        id="shell-mobile-nav"
        className={
          open
            ? `border-t px-4 py-4 lg:hidden ${variant === "indigo" ? "border-indigo-100 bg-white" : "border-zinc-200 bg-white"}`
            : "hidden"
        }
      >
        <nav className="flex flex-col gap-1" aria-label="Mobile section">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={linkClass(navActive(item.href), variant)}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {trailing ? (
          <div className="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-4">
            {trailing}
          </div>
        ) : null}
      </div>
    </header>
  );
}
