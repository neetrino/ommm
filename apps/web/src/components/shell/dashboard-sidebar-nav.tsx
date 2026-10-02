"use client";

import { useId } from "react";
import { LayoutGroup } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import { AdminNavIcon } from "@/components/shell/admin-nav-icon";
import { adminNavIconSlugForHref } from "@/components/shell/admin-nav-icon-map";
import { OliveNavActiveThumb } from "@/components/shell/olive-nav-active-thumb";
import { useOliveNavHardNavigate } from "@/components/shell/use-olive-nav-hard-navigate";
import { useOliveNavOptimisticActive } from "@/components/shell/use-olive-nav-optimistic-active";
import { isOliveDashboardShell } from "@/components/shell/dashboard-shell-variant-utils";
import type { DashboardShellVariant } from "@/components/shell/dashboard-shell-types";
import { useMemberHubSheetPhone } from "@/hooks/use-member-hub-sheet-phone";
import {
  dashboardNavPathActive,
  memberOliveIconSlugForNavItem,
  type DashboardNavItem,
} from "@/lib/dashboard-nav";
import { shouldMemberHardNavigate } from "@/lib/member-user-nav-hard-navigate";
import {
  localizedWorkspaceHref,
  WORKSPACE_ROUTE_PREFETCH,
} from "@/lib/workspace-nav-link";

/** Stable across soft navigations so Framer can morph the active pill. */
const OLIVE_NAV_PILL_LAYOUT_ID = "ommm-olive-nav-active-pill";

function navActive(pathname: string, href: string) {
  return dashboardNavPathActive(pathname, href);
}

function accentBorder(variant: DashboardShellVariant) {
  if (variant === "indigo") return "border-indigo-600";
  if (variant === "wellness") return "border-sand-600";
  return "border-blue-600";
}

function oliveNavIconSlug(
  variant: DashboardShellVariant,
  item: DashboardNavItem,
): ReturnType<typeof adminNavIconSlugForHref> {
  if (variant === "member") {
    return memberOliveIconSlugForNavItem(item);
  }
  if (item.oliveIconSlug) {
    return item.oliveIconSlug;
  }
  if (variant === "admin") {
    return adminNavIconSlugForHref(item.href);
  }
  return null;
}

function rowBase(variant: DashboardShellVariant, collapsed: boolean) {
  if (isOliveDashboardShell(variant)) {
    return "ommm-admin-nav-link";
  }
  const gap = collapsed ? "justify-center gap-0 px-0" : "gap-3 px-3";
  const base = `flex w-full items-center rounded-xl py-2.5 text-sm font-medium transition-colors border-l-4 ${gap}`;
  if (variant === "indigo") {
    return `${base} border-transparent text-indigo-900/90 hover:bg-indigo-50 hover:text-indigo-950`;
  }
  if (variant === "wellness") {
    return `${base} border-transparent text-sage-700 hover:bg-white/55 hover:text-sage-900`;
  }
  return `${base} border-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900`;
}

function rowActive(variant: DashboardShellVariant, collapsed: boolean) {
  if (isOliveDashboardShell(variant)) {
    return "ommm-admin-nav-link ommm-admin-nav-link-active";
  }
  const gap = collapsed ? "justify-center gap-0 px-0" : "gap-3 px-3";
  const border = accentBorder(variant);
  if (variant === "indigo") {
    return `flex w-full items-center rounded-xl py-2.5 text-sm font-medium border-l-4 ${border} bg-indigo-100 text-indigo-950 ${gap}`;
  }
  if (variant === "wellness") {
    return `flex w-full items-center rounded-xl py-2.5 text-sm font-medium border-l-4 ${border} bg-white/85 text-sage-900 shadow-sm ${gap}`;
  }
  return `flex w-full items-center rounded-xl py-2.5 text-sm font-medium border-l-4 ${border} bg-zinc-100 text-zinc-900 ${gap}`;
}

export type DashboardSidebarNavProps = {
  items: DashboardNavItem[];
  variant: DashboardShellVariant;
  pathname: string;
  collapsed: boolean;
  onNavigate: () => void;
  /**
   * Desktop member only — full document navigation bypasses intercept routes.
   * Phones keep soft-nav so hub sections open as bottom sheets.
   */
  hardNavigate?: boolean;
};

export function DashboardSidebarNav({
  items,
  variant,
  pathname,
  collapsed,
  onNavigate,
  hardNavigate = false,
}: DashboardSidebarNavProps) {
  const locale = useLocale();
  const tShell = useTranslations("dashboard.shell");
  const layoutGroupId = useId();
  const isPhone = useMemberHubSheetPhone();
  const isOliveShell = isOliveDashboardShell(variant);
  const olivePillLayoutId = isOliveShell
    ? OLIVE_NAV_PILL_LAYOUT_ID
    : `${layoutGroupId}-active-pill`;
  const allowHardNavigate = hardNavigate && !isPhone;
  const { activePathname: hardActivePathname, onHardNavigateClick } =
    useOliveNavHardNavigate(pathname);
  const { activePathname: softActivePathname, onNavItemClick } =
    useOliveNavOptimisticActive(pathname);
  const activePathname = allowHardNavigate ? hardActivePathname : softActivePathname;

  return (
    <LayoutGroup id={olivePillLayoutId}>
      <nav
        className={
          isOliveShell ? "ommm-admin-nav-list" : "flex flex-col gap-0.5 p-2"
        }
        aria-label={tShell("dashboardNavAria")}
      >
        {items.map((item) => {
          const active = navActive(activePathname, item.href);
          const oliveIconSlug = isOliveShell
            ? oliveNavIconSlug(variant, item)
            : null;
          const useHardNavigate =
            allowHardNavigate && shouldMemberHardNavigate(pathname, item.href);

          const rowClassName = active
            ? rowActive(variant, collapsed)
            : rowBase(variant, collapsed);

          const rowContent = (
            <>
              {active && isOliveShell ? (
                <OliveNavActiveThumb layoutId={olivePillLayoutId} />
              ) : null}
              {oliveIconSlug ? (
                <span className="ommm-admin-nav-icon">
                  <AdminNavIcon slug={oliveIconSlug} />
                </span>
              ) : (
                <DashboardNavIcon name={item.icon} />
              )}
              <span
                className={
                  collapsed
                    ? "sr-only"
                    : "min-w-0 flex-1 truncate text-left leading-tight"
                }
              >
                {item.label}
              </span>
            </>
          );

          return useHardNavigate ? (
            <a
              key={item.href}
              href={localizedWorkspaceHref(locale, item.href)}
              title={collapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              className={rowClassName}
              onClick={(event) =>
                onHardNavigateClick(event, item.href, onNavigate)
              }
            >
              {rowContent}
            </a>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              prefetch={isOliveShell ? WORKSPACE_ROUTE_PREFETCH : undefined}
              title={collapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              className={rowClassName}
              onClick={() => onNavItemClick(item.href, onNavigate)}
            >
              {rowContent}
            </Link>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}
