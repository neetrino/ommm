"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import type { DashboardNavItem } from "@/lib/dashboard-nav";
import type { DashboardShellVariant } from "@/components/shell/dashboard-shell-types";

function navActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

function accentBorder(variant: DashboardShellVariant) {
  if (variant === "indigo") return "border-indigo-600";
  if (variant === "wellness") return "border-sand-600";
  return "border-blue-600";
}

function rowBase(variant: DashboardShellVariant, collapsed: boolean) {
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
  return (
    <nav
      className="flex flex-col gap-0.5 p-2"
      aria-label={tShell("dashboardNavAria")}
    >
      {items.map((item) => {
        const active = navActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={active ? rowActive(variant, collapsed) : rowBase(variant, collapsed)}
            onClick={onNavigate}
          >
            <DashboardNavIcon name={item.icon} />
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
        );
      })}
    </nav>
  );
}
