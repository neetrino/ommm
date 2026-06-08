"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import { AdminNavIcon } from "@/components/shell/admin-nav-icon";
import { adminNavIconSlugForHref } from "@/components/shell/admin-nav-icon-map";
import { isOliveDashboardShell } from "@/components/shell/dashboard-shell-variant-utils";
import type { DashboardShellVariant } from "@/components/shell/dashboard-shell-types";
import {
  dashboardNavPathActive,
  memberOliveIconSlugForNavItem,
  type DashboardNavItem,
} from "@/lib/dashboard-nav";
import { WORKSPACE_ROUTE_PREFETCH } from "@/lib/workspace-nav-link";

const ADMIN_MUTED_NAV_HREFS = new Set(["/admin/guest-users", "/admin/profile"]);

function navActive(pathname: string, href: string) {
  return dashboardNavPathActive(pathname, href);
}

function isAdminMutedNavItem(variant: DashboardShellVariant, href: string) {
  return variant === "admin" && ADMIN_MUTED_NAV_HREFS.has(href);
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

function rowBase(
  variant: DashboardShellVariant,
  collapsed: boolean,
  muted: boolean,
) {
  if (isOliveDashboardShell(variant)) {
    return muted
      ? "ommm-admin-nav-link ommm-admin-nav-link-muted"
      : "ommm-admin-nav-link";
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

function rowActive(
  variant: DashboardShellVariant,
  collapsed: boolean,
  muted: boolean,
) {
  if (isOliveDashboardShell(variant)) {
    return muted
      ? "ommm-admin-nav-link ommm-admin-nav-link-muted ommm-admin-nav-link-active"
      : "ommm-admin-nav-link ommm-admin-nav-link-active";
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
};

export function DashboardSidebarNav({
  items,
  variant,
  pathname,
  collapsed,
  onNavigate,
}: DashboardSidebarNavProps) {
  const tShell = useTranslations("dashboard.shell");
  const isOliveShell = isOliveDashboardShell(variant);
  const isAdmin = variant === "admin";
  const firstMutedIndex = isAdmin
    ? items.findIndex((item) => isAdminMutedNavItem(variant, item.href))
    : -1;

  return (
    <nav
      className={
        isOliveShell ? "ommm-admin-nav-list" : "flex flex-col gap-0.5 p-2"
      }
      aria-label={tShell("dashboardNavAria")}
    >
      {items.map((item, index) => {
        const active = navActive(pathname, item.href);
        const muted = isAdminMutedNavItem(variant, item.href);
        const oliveIconSlug = isOliveShell
          ? oliveNavIconSlug(variant, item)
          : null;
        const showMutedDivider = isAdmin && index === firstMutedIndex;

        return (
          <div key={item.href}>
            {showMutedDivider ? <div className="ommm-admin-nav-divider" aria-hidden /> : null}
            <Link
              href={item.href}
              prefetch={isOliveShell ? WORKSPACE_ROUTE_PREFETCH : undefined}
              title={collapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? rowActive(variant, collapsed, muted)
                  : rowBase(variant, collapsed, muted)
              }
              onClick={onNavigate}
            >
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
                    : "min-w-0 truncate text-left leading-tight"
                }
              >
                {item.label}
              </span>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
