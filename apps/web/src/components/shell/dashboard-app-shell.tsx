"use client";

import { startTransition, useEffect, useState, type ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { dashboardHeadingFromPath } from "@/lib/dashboard-heading";
import type { DashboardNavItem } from "@/lib/dashboard-nav";
import { DashboardSidebarNav } from "@/components/shell/dashboard-sidebar-nav";
import type { DashboardShellVariant } from "@/components/shell/dashboard-shell-types";
import {
  avatarRingClass,
  brandInitial,
  brandSublineClass,
  brandTitleClass,
  collapseToggleClass,
  headerBarClass,
  menuButtonClass,
  pageBackgroundClass,
  sidebarAsideBgClass,
  sidebarBrandStripClass,
  sidebarShellBorderClass,
  subtitleClass,
  titleClass,
} from "@/components/shell/dashboard-shell-classes";

export type { DashboardShellVariant } from "@/components/shell/dashboard-shell-types";

const SIDEBAR_COLLAPSED_KEY = "ommm.dashboard.sidebarCollapsed";

export type DashboardAppShellProps = {
  brandHref: string;
  brandLabel: string;
  /** Second line under the brand in the sidebar (Ilona-style). */
  brandSubline?: string;
  navItems: DashboardNavItem[];
  variant?: DashboardShellVariant;
  contentMaxClass?: string;
  trailing?: ReactNode;
  children: ReactNode;
};

export function DashboardAppShell({
  brandHref,
  brandLabel,
  brandSubline,
  navItems,
  variant = "neutral",
  contentMaxClass = "max-w-6xl",
  trailing,
  children,
}: DashboardAppShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1") {
        startTransition(() => {
          setSidebarCollapsed(true);
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const heading = dashboardHeadingFromPath(pathname, navItems);

  function persistCollapsed(next: boolean) {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      }
    } catch {
      /* ignore */
    }
    setSidebarCollapsed(next);
  }

  const asideWidth = sidebarCollapsed ? "lg:w-[4.5rem]" : "lg:w-64";
  const borderB = `border-b ${sidebarShellBorderClass(variant)}`;

  return (
    <div className={pageBackgroundClass(variant)}>
      <div
        className={`mx-auto flex min-h-screen w-full flex-col lg:flex-row ${contentMaxClass}`}
      >
        <aside
          className={`hidden shrink-0 flex-col border-r shadow-sm lg:sticky lg:top-0 lg:flex lg:h-screen ${asideWidth} ${sidebarShellBorderClass(variant)} ${sidebarAsideBgClass(variant)} transition-[width] duration-200 ease-out`}
          aria-label="Workspace"
        >
          <div
            className={
              sidebarCollapsed
                ? `flex flex-col items-center gap-2 px-1 py-3 ${borderB} ${sidebarBrandStripClass(variant)}`
                : `flex items-start gap-2 px-2 py-4 ${borderB} ${sidebarBrandStripClass(variant)}`
            }
          >
            <Link
              href={brandHref}
              className={
                sidebarCollapsed
                  ? `flex items-center justify-center rounded-xl px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variant === "indigo" ? "focus-visible:ring-indigo-600" : variant === "wellness" ? "focus-visible:ring-sand-500" : "focus-visible:ring-zinc-900"}`
                  : `flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variant === "indigo" ? "focus-visible:ring-indigo-600" : variant === "wellness" ? "focus-visible:ring-sand-500" : "focus-visible:ring-zinc-900"}`
              }
              onClick={() => setDrawerOpen(false)}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${avatarRingClass(variant)}`}
              >
                {brandInitial(brandLabel)}
              </span>
              {sidebarCollapsed ? (
                <span className="sr-only">{brandLabel}</span>
              ) : (
                <span className="min-w-0 flex-1">
                  <span className={brandTitleClass(variant)}>{brandLabel}</span>
                  {brandSubline ? (
                    <span className={brandSublineClass(variant)}>
                      {brandSubline}
                    </span>
                  ) : null}
                </span>
              )}
            </Link>
            <button
              type="button"
              className={collapseToggleClass(variant)}
              aria-expanded={!sidebarCollapsed}
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              onClick={() => persistCollapsed(!sidebarCollapsed)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                {sidebarCollapsed ? (
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <DashboardSidebarNav
              items={navItems}
              variant={variant}
              pathname={pathname}
              collapsed={sidebarCollapsed}
              onNavigate={() => undefined}
            />
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className={`border-b ${headerBarClass(variant)}`}>
            <div className="flex h-14 w-full items-start gap-3 px-4 py-2 sm:h-auto sm:items-center sm:py-3 sm:pl-6 sm:pr-6 lg:min-h-[4rem]">
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

              {sidebarCollapsed ? (
                <button
                  type="button"
                  className={`${collapseToggleClass(variant)} mt-0 hidden lg:inline-flex`}
                  aria-expanded={false}
                  aria-label="Expand sidebar"
                  onClick={() => persistCollapsed(false)}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path
                      d="M9 6l6 6-6 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ) : null}

              <div className="flex min-w-0 flex-1 flex-col justify-center pt-0.5 sm:pt-0">
                <h1 className={titleClass(variant)}>{heading.title}</h1>
                {heading.subtitle ? (
                  <p className={`mt-0.5 ${subtitleClass(variant)}`}>
                    {heading.subtitle}
                  </p>
                ) : null}
              </div>

              <div className="hidden shrink-0 items-center gap-3 lg:flex">
                {trailing}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            {children}
          </main>
        </div>
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
            className={`relative z-50 flex h-full w-[min(20rem,88vw)] max-w-full flex-col border-r border-zinc-200 bg-white shadow-xl`}
          >
            <div
              className={`flex shrink-0 items-center gap-3 px-4 py-4 ${borderB}`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${avatarRingClass(variant)}`}
              >
                {brandInitial(brandLabel)}
              </span>
              <div className="min-w-0">
                <span className="block truncate text-sm font-semibold text-zinc-900">
                  {brandLabel}
                </span>
                {brandSubline ? (
                  <span className="block truncate text-xs text-zinc-500">
                    {brandSubline}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <DashboardSidebarNav
                items={navItems}
                variant={variant}
                pathname={pathname}
                collapsed={false}
                onNavigate={() => setDrawerOpen(false)}
              />
            </div>
            {trailing ? (
              <div className="shrink-0 space-y-3 border-t border-zinc-100 p-4">
                {trailing}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
