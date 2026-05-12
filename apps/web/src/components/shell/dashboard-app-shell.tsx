"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { DashboardNavItem } from "@/lib/dashboard-nav";

export type DashboardShellVariant = "neutral" | "indigo" | "wellness";

export type DashboardAppShellProps = {
  brandHref: string;
  brandLabel: string;
  navItems: DashboardNavItem[];
  variant?: DashboardShellVariant;
  /** Width class for the main content column (sidebar sits outside this cap). */
  contentMaxClass?: string;
  trailing?: ReactNode;
  children: ReactNode;
};

function navActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

function headerBarClass(variant: DashboardShellVariant) {
  if (variant === "indigo") return "border-indigo-100 bg-white";
  if (variant === "wellness")
    return "border-white/55 bg-white/55 shadow-sm backdrop-blur-md";
  return "border-zinc-200 bg-white";
}

function brandClass(variant: DashboardShellVariant) {
  if (variant === "indigo") return "font-semibold text-indigo-950";
  if (variant === "wellness") return "font-semibold text-sage-900";
  return "font-semibold text-zinc-900";
}

function sidebarAsideClass(variant: DashboardShellVariant) {
  if (variant === "indigo")
    return "border-indigo-100 bg-white shadow-sm";
  if (variant === "wellness")
    return "border-white/50 bg-white/40 shadow-sm backdrop-blur-md";
  return "border-zinc-200 bg-white shadow-sm";
}

function sidebarLinkClass(
  active: boolean,
  variant: DashboardShellVariant,
): string {
  const base =
    "flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors";
  if (variant === "indigo") {
    return [
      base,
      active
        ? "bg-indigo-100 text-indigo-950"
        : "text-indigo-900/90 hover:bg-indigo-50 hover:text-indigo-950",
    ].join(" ");
  }
  if (variant === "wellness") {
    return [
      base,
      active
        ? "bg-white/80 text-sage-900 shadow-sm"
        : "text-sage-700 hover:bg-white/55 hover:text-sage-900",
    ].join(" ");
  }
  return [
    base,
    active
      ? "bg-zinc-100 text-zinc-900"
      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
  ].join(" ");
}

function menuButtonClass(variant: DashboardShellVariant) {
  if (variant === "indigo")
    return "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-white text-indigo-950 shadow-sm lg:hidden";
  if (variant === "wellness")
    return "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/70 bg-white/80 text-sage-800 shadow-sm backdrop-blur-sm lg:hidden";
  return "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-800 shadow-sm lg:hidden";
}

function pageBackgroundClass(variant: DashboardShellVariant) {
  if (variant === "indigo") return "min-h-screen bg-indigo-50/50";
  if (variant === "wellness") return "min-h-screen ommm-bg-wellness";
  return "min-h-screen bg-zinc-100";
}

function renderNavLinks(
  items: DashboardNavItem[],
  variant: DashboardShellVariant,
  pathname: string,
  onNavigate: () => void,
) {
  return (
    <nav className="flex flex-col gap-1 p-3" aria-label="Dashboard">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={sidebarLinkClass(navActive(pathname, item.href), variant)}
          onClick={onNavigate}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function DashboardAppShell({
  brandHref,
  brandLabel,
  navItems,
  variant = "neutral",
  contentMaxClass = "max-w-6xl",
  trailing,
  children,
}: DashboardAppShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  return (
    <div className={pageBackgroundClass(variant)}>
      <header className={`border-b ${headerBarClass(variant)}`}>
        <div
          className={`mx-auto flex h-14 w-full items-center gap-3 px-4 sm:h-16 ${contentMaxClass}`}
        >
          <button
            type="button"
            className={menuButtonClass(variant)}
            aria-expanded={drawerOpen}
            aria-controls="dashboard-mobile-drawer"
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            onClick={() => setDrawerOpen((o) => !o)}
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
              {drawerOpen ? (
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

          <Link
            href={brandHref}
            className={`min-w-0 truncate ${brandClass(variant)}`}
            onClick={() => setDrawerOpen(false)}
          >
            {brandLabel}
          </Link>

          <div className="ml-auto hidden items-center gap-3 lg:flex">
            {trailing}
          </div>
        </div>
      </header>

        <div
          className={`mx-auto flex w-full flex-1 flex-col lg:flex-row ${contentMaxClass}`}
        >
        <aside
          className={`hidden w-60 shrink-0 border-r lg:sticky lg:top-0 lg:flex lg:max-h-[calc(100vh-4rem)] lg:flex-col lg:self-start ${sidebarAsideClass(variant)}`}
          aria-label="Dashboard sections"
        >
          {renderNavLinks(navItems, variant, pathname, () => undefined)}
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          {children}
        </main>
      </div>

      {drawerOpen ? (
        <div
          className="fixed inset-0 z-40 flex lg:hidden"
          id="dashboard-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/40"
            aria-label="Close menu overlay"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className={`relative z-50 flex h-full w-[min(20rem,88vw)] max-w-full flex-col border-r shadow-xl ${sidebarAsideClass(variant)}`}
          >
            <div
              className={`flex h-14 shrink-0 items-center border-b px-4 sm:h-16 ${variant === "indigo" ? "border-indigo-100" : variant === "wellness" ? "border-white/50" : "border-zinc-100"}`}
            >
              <span className={`truncate text-sm font-semibold ${brandClass(variant)}`}>
                {brandLabel}
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {renderNavLinks(navItems, variant, pathname, () =>
                setDrawerOpen(false),
              )}
            </div>
            {trailing ? (
              <div
                className={`shrink-0 space-y-3 border-t p-4 ${variant === "indigo" ? "border-indigo-100" : variant === "wellness" ? "border-white/50" : "border-zinc-100"}`}
              >
                {trailing}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
