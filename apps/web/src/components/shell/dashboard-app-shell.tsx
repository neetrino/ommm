"use client";

import { startTransition, useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  type DashboardNavDefinition,
  type DashboardNavItem,
  type DashboardRoleNotificationRoute,
} from "@/lib/dashboard-nav";
import type { DashboardNavRole } from "@/lib/dashboard-types";
import { DashboardSidebarNav } from "@/components/shell/dashboard-sidebar-nav";
import { WorkspacePageAppear } from "@/components/shell/workspace-page-appear";
import { WorkspaceMobileDrawer } from "@/components/shell/workspace-mobile-drawer";
import { isOliveDashboardShell } from "@/components/shell/dashboard-shell-variant-utils";
import type { DashboardShellVariant } from "@/components/shell/dashboard-shell-types";
import { WORKSPACE_ROUTE_PREFETCH } from "@/lib/workspace-nav-link";
import offsetStyles from "@/components/marketing/marketing-site-header-offset.module.css";
import {
  avatarRingClass,
  brandInitial,
  brandSublineClass,
  brandTitleClass,
  collapseToggleClass,
  DASHBOARD_HEADER_STRIP_MIN_HEIGHT_CLASS,
  MEMBER_DESKTOP_SIDEBAR_WIDTH_COLLAPSED,
  MEMBER_DESKTOP_SIDEBAR_WIDTH_EXPANDED,
  pageBackgroundClass,
  sidebarAsideBgClass,
  sidebarBrandStripClass,
  sidebarShellBorderClass,
  OMMM_MEMBER_SIDEBAR_WIDTH_VAR,
} from "@/components/shell/dashboard-shell-classes";
import { workspaceMobileDrawerLayout } from "@/components/shell/workspace-mobile-drawer-layout";

export type { DashboardShellVariant } from "@/components/shell/dashboard-shell-types";

const SIDEBAR_COLLAPSED_KEY = "ommm.dashboard.sidebarCollapsed";

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
  /** Reserve space and adjust sticky regions for the fixed global site header. */
  withSiteHeader?: boolean;
  drawerOpen?: boolean;
  onDrawerOpenChange?: (open: boolean) => void;
  trailing?: ReactNode;
  children: ReactNode;
};

export function DashboardAppShell({
  brandHref,
  brandLabel,
  brandSubline,
  navRole,
  navDefinitions,
  variant = "neutral",
  contentMaxClass = "max-w-6xl",
  withSiteHeader = false,
  drawerOpen: drawerOpenProp,
  onDrawerOpenChange,
  trailing,
  children,
}: DashboardAppShellProps) {
  const pathname = usePathname();
  const tNav = useTranslations("dashboard.nav");
  const tShell = useTranslations("dashboard.shell");
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const drawerOpen = drawerOpenProp ?? internalDrawerOpen;
  const setDrawerOpen = onDrawerOpenChange ?? setInternalDrawerOpen;

  const navItems: DashboardNavItem[] = useMemo(
    () =>
      navDefinitions.map((d) => ({
        href: d.href,
        icon: d.icon,
        oliveIconSlug: d.oliveIconSlug,
        label: (tNav as (key: string) => string)(`${navRole}.${d.labelKey}`),
      })),
    [navDefinitions, navRole, tNav],
  );

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
    if (variant !== "member") {
      return undefined;
    }

    const sidebarWidth = sidebarCollapsed
      ? MEMBER_DESKTOP_SIDEBAR_WIDTH_COLLAPSED
      : MEMBER_DESKTOP_SIDEBAR_WIDTH_EXPANDED;

    document.documentElement.style.setProperty(OMMM_MEMBER_SIDEBAR_WIDTH_VAR, sidebarWidth);

    return () => {
      document.documentElement.style.removeProperty(OMMM_MEMBER_SIDEBAR_WIDTH_VAR);
    };
  }, [variant, sidebarCollapsed]);

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

  const isOliveShell = isOliveDashboardShell(variant);
  const asideWidth = isOliveShell
    ? "lg:w-72"
    : sidebarCollapsed
      ? "lg:w-[4.5rem]"
      : "lg:w-64";
  const borderB = isOliveShell ? "" : `border-b ${sidebarShellBorderClass(variant)}`;
  /**
   * Mobile: glass pill overlays the scroll pane (no cream header band).
   * Staff keeps nested scroll + non-sticky page banners; member uses window-scroll classes.
   */
  const useMobileHeaderOverlay = withSiteHeader;
  const rootClassName = withSiteHeader
    ? [
        pageBackgroundClass(variant),
        offsetStyles.dashboardWithMarketingHeader,
        useMobileHeaderOverlay ? offsetStyles.dashboardWithMarketingHeaderOverlay : "",
        variant === "member" ? offsetStyles.dashboardWithMarketingHeaderMemberMobile : "",
      ]
        .filter(Boolean)
        .join(" ")
    : pageBackgroundClass(variant);
  const sidebarStickyClass = withSiteHeader
    ? offsetStyles.sidebarFixedBelowMarketingHeader
    : "lg:sticky lg:top-0 lg:h-screen lg:max-h-screen lg:self-start";
  const mainPaddingClass = isOliveShell
    ? "flex-1 px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8 lg:pb-10"
    : "flex-1 px-4 pt-0 pb-6 sm:px-6 sm:pb-8 lg:px-8 lg:pb-10";
  const mainClassName = [
    mainPaddingClass,
    withSiteHeader ? offsetStyles.workspaceScrollMain : "",
  ]
    .filter(Boolean)
    .join(" ");
  const layoutMinHeightClass = withSiteHeader ? "min-h-full" : "min-h-screen";
  const workspaceBodyClassName = [
    `mx-auto flex ${layoutMinHeightClass} w-full flex-col lg:flex-row`,
    contentMaxClass,
  ]
    .filter(Boolean)
    .join(" ");

  const workspaceBody = (
    <div className={workspaceBodyClassName}>
      {withSiteHeader ? (
        <div
          className={`${workspaceMobileDrawerLayout.desktopSidebarSpacer} ${asideWidth}`}
          aria-hidden
        />
      ) : null}
      <aside
        className={`${workspaceMobileDrawerLayout.desktopSidebar} shadow-sm ${withSiteHeader ? "" : "lg:sticky lg:self-start"} ${sidebarStickyClass} ${asideWidth} ${
          isOliveShell
            ? "ommm-admin-sidebar rounded-br-[40px] rounded-tr-[40px] border-r-0 py-6"
            : `border-r ${sidebarShellBorderClass(variant)} ${sidebarAsideBgClass(variant)}`
        } transition-[width] duration-200 ease-out`}
        aria-label={tShell("workspaceAria")}
      >
          <div
            className={
              isOliveShell
                ? "px-8 pb-6"
                : sidebarCollapsed
                  ? `flex flex-col-reverse items-center gap-2 px-1 py-3 ${borderB} ${sidebarBrandStripClass(variant)}`
                  : `flex items-center gap-2 px-2 py-4 ${DASHBOARD_HEADER_STRIP_MIN_HEIGHT_CLASS} ${borderB} ${sidebarBrandStripClass(variant)}`
            }
          >
            <Link
              href={brandHref}
              prefetch={isOliveShell ? WORKSPACE_ROUTE_PREFETCH : undefined}
              className={
                isOliveShell
                  ? "block min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#97907c]"
                  : sidebarCollapsed
                    ? `flex items-center justify-center rounded-xl px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variant === "indigo" ? "focus-visible:ring-indigo-600" : variant === "wellness" ? "focus-visible:ring-sand-500" : "focus-visible:ring-zinc-900"}`
                    : `flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variant === "indigo" ? "focus-visible:ring-indigo-600" : variant === "wellness" ? "focus-visible:ring-sand-500" : "focus-visible:ring-zinc-900"}`
              }
              onClick={() => setDrawerOpen(false)}
            >
              {!isOliveShell ? (
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${avatarRingClass(variant)}`}
                >
                  {brandInitial(brandLabel)}
                </span>
              ) : null}
              {sidebarCollapsed && !isOliveShell ? (
                <span className="sr-only">{brandLabel}</span>
              ) : (
                <span className="min-w-0 flex-1">
                  <span
                    className={
                      isOliveShell
                        ? "ommm-admin-sidebar-brand-title"
                        : brandTitleClass(variant)
                    }
                  >
                    {brandLabel}
                  </span>
                  {brandSubline ? (
                    <span
                      className={
                        isOliveShell
                          ? "ommm-admin-sidebar-brand-subline"
                          : brandSublineClass(variant)
                      }
                    >
                      {brandSubline}
                    </span>
                  ) : null}
                </span>
              )}
            </Link>
            {!isOliveShell ? (
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
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <DashboardSidebarNav
              items={navItems}
              variant={variant}
              pathname={pathname}
              collapsed={isOliveShell ? false : sidebarCollapsed}
              onNavigate={() => undefined}
            />
          </div>
          {isOliveShell && trailing ? (
            <div className="mt-auto space-y-2 px-6 pb-2 pt-4">{trailing}</div>
          ) : null}
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <main className={mainClassName}>
            <WorkspacePageAppear pathname={pathname}>{children}</WorkspacePageAppear>
          </main>
        </div>
      </div>
  );

  return (
    <div className={rootClassName}>
      {withSiteHeader ? (
        <div
          data-workspace-scroll-pane
          className={[
            offsetStyles.dashboardWithMarketingHeaderScroll,
            offsetStyles.dashboardWithMarketingHeaderScrollOverlay,
            variant === "member"
              ? offsetStyles.dashboardWithMarketingHeaderScrollMemberMobile
              : offsetStyles.dashboardWithMarketingHeaderScrollStaffMobile,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {workspaceBody}
        </div>
      ) : (
        workspaceBody
      )}

      <WorkspaceMobileDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        variant={variant}
        withSiteHeader={withSiteHeader}
        brandLabel={brandLabel}
        brandSubline={brandSubline}
        navItems={navItems}
        pathname={pathname}
        trailing={trailing}
      />
    </div>
  );
}
