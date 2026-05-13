"use client";

import { startTransition, useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Link, usePathname } from "@/i18n/navigation";
import type {
  DashboardNavDefinition,
  DashboardNavItem,
  DashboardRoleNotificationRoute,
} from "@/lib/dashboard-nav";
import { dashboardSubtitlePathFromHref } from "@/lib/dashboard-subtitle-path";
import type { DashboardNavRole } from "@/lib/dashboard-types";
import { DashboardSidebarNav } from "@/components/shell/dashboard-sidebar-nav";
import type { DashboardShellVariant } from "@/components/shell/dashboard-shell-types";
import {
  avatarRingClass,
  brandInitial,
  brandSublineClass,
  brandTitleClass,
  collapseToggleClass,
  DASHBOARD_HEADER_STRIP_MIN_HEIGHT_CLASS,
  DASHBOARD_MAIN_HEADER_STICKY_CLASS,
  menuButtonClass,
  mobileDrawerBrandSublineClass,
  mobileDrawerBrandTitleClass,
  mobileDrawerFooterClass,
  mobileDrawerHeaderBorderClass,
  mobileDrawerOverlayScrimClass,
  mobileDrawerPanelClass,
  pageBackgroundClass,
  sidebarAsideBgClass,
  sidebarBrandStripClass,
  sidebarShellBorderClass,
  subtitleClass,
  titleClass,
} from "@/components/shell/dashboard-shell-classes";

export type { DashboardShellVariant } from "@/components/shell/dashboard-shell-types";

const SIDEBAR_COLLAPSED_KEY = "ommm.dashboard.sidebarCollapsed";

function pathMatchesNav(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

export type DashboardAppShellProps = {
  brandHref: string;
  brandLabel: string;
  /** Second line under the brand in the sidebar (Ilona-style). */
  brandSubline?: string;
  navRole: DashboardNavRole;
  navDefinitions: DashboardNavDefinition[];
  notificationRoute: DashboardRoleNotificationRoute | null;
  variant?: DashboardShellVariant;
  contentMaxClass?: string;
  trailing?: ReactNode;
  children: ReactNode;
};

export function DashboardAppShell({
  brandHref,
  brandLabel,
  brandSubline,
  navRole,
  navDefinitions,
  notificationRoute,
  variant = "neutral",
  contentMaxClass = "max-w-6xl",
  trailing,
  children,
}: DashboardAppShellProps) {
  const pathname = usePathname();
  const tNav = useTranslations("dashboard.nav");
  const tSub = useTranslations("dashboard.subtitles");
  const tShell = useTranslations("dashboard.shell");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems: DashboardNavItem[] = useMemo(
    () =>
      navDefinitions.map((d) => ({
        href: d.href,
        icon: d.icon,
        label: (tNav as (key: string) => string)(`${navRole}.${d.labelKey}`),
      })),
    [navDefinitions, navRole, tNav],
  );

  const heading = useMemo(() => {
    const matches = navItems.filter((item) =>
      pathMatchesNav(pathname, item.href),
    );
    if (matches.length === 0) {
      return { title: tShell("fallbackTitle"), subtitle: "" };
    }
    const best = matches.reduce((a, b) =>
      a.href.length >= b.href.length ? a : b,
    );
    const subPath = dashboardSubtitlePathFromHref(best.href);
    const subtitle =
      subPath !== null && subPath.length > 0
        ? (tSub as (key: string) => string)(subPath)
        : "";
    return { title: best.label, subtitle };
  }, [navItems, pathname, tShell, tSub]);

  const notificationsLabel = useMemo(() => {
    if (!notificationRoute) return null;
    return (tNav as (key: string) => string)(
      `${navRole}.${notificationRoute.labelKey}`,
    );
  }, [navRole, notificationRoute, tNav]);

  const notificationsActive =
    notificationRoute !== null && pathMatchesNav(pathname, notificationRoute.href);

  const notificationButtonClass = useMemo(() => {
    if (variant === "indigo") {
      return notificationsActive
        ? "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-300 bg-indigo-100 text-indigo-950 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
        : "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-white text-indigo-900 shadow-sm transition-colors hover:bg-indigo-50 hover:text-indigo-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2";
    }
    if (variant === "wellness") {
      return notificationsActive
        ? "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/90 bg-white text-sage-900 shadow-sm backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        : "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/70 bg-white/80 text-sage-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";
    }
    return notificationsActive
      ? "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-300 bg-zinc-100 text-zinc-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
      : "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";
  }, [notificationsActive, variant]);

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
          aria-label={tShell("workspaceAria")}
        >
          <div
            className={
              sidebarCollapsed
                ? `flex flex-col-reverse items-center gap-2 px-1 py-3 ${borderB} ${sidebarBrandStripClass(variant)}`
                : `flex items-center gap-2 px-2 py-4 ${DASHBOARD_HEADER_STRIP_MIN_HEIGHT_CLASS} ${borderB} ${sidebarBrandStripClass(variant)}`
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
                sidebarCollapsed
                  ? tShell("expandSidebar")
                  : tShell("collapseSidebar")
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
          <header
            className={`${DASHBOARD_MAIN_HEADER_STICKY_CLASS} shrink-0`}
          >
            <div
              className={`flex w-full items-center gap-2 px-2 py-4 ${DASHBOARD_HEADER_STRIP_MIN_HEIGHT_CLASS} ${borderB} ${sidebarBrandStripClass(variant)}`}
            >
              <button
                type="button"
                className={menuButtonClass(variant)}
                aria-expanded={drawerOpen}
                aria-controls="dashboard-mobile-drawer"
                aria-label={
                  drawerOpen ? tShell("closeMenu") : tShell("openMenu")
                }
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

              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <h1 className={titleClass(variant)}>{heading.title}</h1>
                {heading.subtitle ? (
                  <p className={`mt-0.5 ${subtitleClass(variant)}`}>
                    {heading.subtitle}
                  </p>
                ) : null}
              </div>

              <LanguageSwitcher
                context="dashboard"
                dashboardVariant={variant}
                onAfterSelect={() => setDrawerOpen(false)}
              />

              {notificationRoute && notificationsLabel ? (
                <Link
                  href={notificationRoute.href}
                  className={notificationButtonClass}
                  aria-label="Notifications"
                  title={notificationsLabel}
                  onClick={() => setDrawerOpen(false)}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    aria-hidden
                  >
                    <path d="M6 10a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
                    <path d="M10 21h4" />
                  </svg>
                  <span className="sr-only">{notificationsLabel}</span>
                </Link>
              ) : null}

              <div className="hidden shrink-0 items-center gap-3 lg:flex">
                {trailing}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 pt-0 pb-6 sm:px-6 sm:pb-8 lg:px-8 lg:pb-10">
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
          aria-label={tShell("navigationDialogAria")}
        >
          <button
            type="button"
            className={mobileDrawerOverlayScrimClass(variant)}
            aria-label={tShell("closeMenuOverlay")}
            onClick={() => setDrawerOpen(false)}
          />
          <div className={mobileDrawerPanelClass(variant)}>
            <div
              className={`flex shrink-0 items-center gap-3 px-4 py-4 ${mobileDrawerHeaderBorderClass(variant)}`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${avatarRingClass(variant)}`}
              >
                {brandInitial(brandLabel)}
              </span>
              <div className="min-w-0">
                <span className={mobileDrawerBrandTitleClass(variant)}>
                  {brandLabel}
                </span>
                {brandSubline ? (
                  <span className={mobileDrawerBrandSublineClass(variant)}>
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
              <div className={mobileDrawerFooterClass(variant)}>
                {trailing}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
