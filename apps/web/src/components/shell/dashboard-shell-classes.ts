import type { DashboardShellVariant } from "@/components/shell/dashboard-shell-types";
import { workspaceMobileDrawerLayout } from "@/components/shell/workspace-mobile-drawer-layout";

/** Pairs sidebar brand strip + main column header so their bars share the same height. */
export const DASHBOARD_HEADER_STRIP_MIN_HEIGHT_CLASS = "min-h-[5.5rem]";

/** Matches `lg:w-64` / `lg:w-[4.5rem]` in {@link DashboardAppShell}. */
export const MEMBER_DESKTOP_SIDEBAR_WIDTH_EXPANDED = "16rem";

export const MEMBER_DESKTOP_SIDEBAR_WIDTH_COLLAPSED = "4.5rem";

export const OMMM_MEMBER_SIDEBAR_WIDTH_VAR = "--ommm-member-sidebar-width";

/** Main column heading bar: stays visible at the top of the viewport while the page scrolls. */
export const DASHBOARD_MAIN_HEADER_STICKY_CLASS = "sticky z-10";

/** Breathing room between the fixed global site header and page content (workspace shells). */
export const WORKSPACE_MAIN_SAFE_TOP_CLASS = "pt-4 sm:pt-6 lg:pt-8";

/** Admin shell header — opaque sticky surface so page content does not show through on scroll. */
export const DASHBOARD_ADMIN_MAIN_HEADER_STICKY_CLASS =
  "ommm-admin-sticky-header sticky z-20 px-4 pt-4 sm:px-6 lg:px-8";

/** Full-bleed horizontal inset shared by sticky and static page banners. */
export const ADMIN_PAGE_SHELL_INSET_CLASS =
  "-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8";

/** Sticky page banner (AdminPageHero) — full-bleed opaque backdrop on workspace scroll. */
export const ADMIN_PAGE_STICKY_SHELL_CLASS = `ommm-admin-sticky-header sticky z-20 ${ADMIN_PAGE_SHELL_INSET_CLASS}`;

/** Non-sticky page banner — same inset, scrolls away with content (e.g. admin schedule). */
export const ADMIN_PAGE_STATIC_SHELL_CLASS = ADMIN_PAGE_SHELL_INSET_CLASS;

export const ADMIN_PAGE_HERO_STICKY_SHELL_CLASS = `${ADMIN_PAGE_STICKY_SHELL_CLASS} mb-4`;

export const ADMIN_PAGE_HERO_STATIC_SHELL_CLASS = `${ADMIN_PAGE_STATIC_SHELL_CLASS} mb-4`;

export function brandInitial(label: string) {
  const t = label.trim();
  return t.length > 0 ? t.charAt(0).toUpperCase() : "O";
}

export function avatarRingClass(variant: DashboardShellVariant) {
  if (variant === "indigo")
    return "border-indigo-200 bg-indigo-50 text-indigo-900";
  if (variant === "wellness")
    return "border-white/80 bg-white/80 text-sage-800 shadow-sm backdrop-blur-sm";
  return "border-zinc-200 bg-zinc-50 text-zinc-800";
}

export function sidebarShellBorderClass(variant: DashboardShellVariant) {
  if (variant === "indigo") return "border-indigo-100";
  if (variant === "wellness") return "border-white/50";
  return "border-zinc-200";
}

export function sidebarAsideBgClass(variant: DashboardShellVariant) {
  if (variant === "indigo") return "bg-white";
  if (variant === "wellness")
    return "bg-white/40 shadow-sm backdrop-blur-md";
  return "bg-white";
}

export function collapseToggleClass(variant: DashboardShellVariant) {
  if (variant === "indigo")
    return "hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-white text-indigo-800 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 lg:inline-flex";
  if (variant === "wellness")
    return "hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-white/80 text-sage-700 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper lg:inline-flex";
  return "hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 lg:inline-flex";
}

export function pageBackgroundClass(variant: DashboardShellVariant) {
  if (variant === "indigo") return "min-h-screen bg-indigo-50/50";
  if (variant === "wellness") return "min-h-screen ommm-bg-wellness";
  if (variant === "admin" || variant === "member") return "min-h-screen ommm-bg-admin";
  return "min-h-screen bg-zinc-100";
}

export function menuButtonClass(variant: DashboardShellVariant) {
  const mobileOnly = workspaceMobileDrawerLayout.mobileDrawerTrigger;
  if (variant === "indigo")
    return `inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-indigo-200 bg-white text-indigo-950 shadow-sm transition-[background-color,border-color,box-shadow,color,transform] hover:bg-indigo-50 hover:text-indigo-950 hover:shadow-md active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 ${mobileOnly}`;
  if (variant === "wellness")
    return `inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/70 bg-white/80 text-sage-800 shadow-sm backdrop-blur-sm transition-[background-color,border-color,box-shadow,color,transform] hover:border-white hover:bg-white hover:text-sage-900 hover:shadow-md active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 ${mobileOnly}`;
  return `inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-800 shadow-sm transition-[background-color,border-color,box-shadow,color,transform] hover:bg-zinc-50 hover:text-zinc-900 hover:shadow-md active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 ${mobileOnly}`;
}

export function titleClass(variant: DashboardShellVariant) {
  if (variant === "indigo")
    return "truncate text-base font-semibold text-indigo-950";
  if (variant === "wellness")
    return "truncate text-base font-semibold text-sage-900";
  return "truncate text-base font-semibold text-zinc-900";
}

export function subtitleClass(variant: DashboardShellVariant) {
  if (variant === "indigo")
    return "line-clamp-2 text-xs text-indigo-800/75 lg:line-clamp-1";
  if (variant === "wellness")
    return "line-clamp-2 text-xs text-sage-600 lg:line-clamp-1";
  return "line-clamp-2 text-xs text-zinc-500 lg:line-clamp-1";
}

export function brandTitleClass(variant: DashboardShellVariant) {
  if (variant === "indigo") return "block truncate font-semibold text-indigo-950";
  if (variant === "wellness") return "block truncate font-semibold text-sage-900";
  return "block truncate font-semibold text-zinc-900";
}

export function brandSublineClass(variant: DashboardShellVariant) {
  if (variant === "indigo")
    return "mt-0.5 block truncate text-xs font-normal text-indigo-900/70";
  if (variant === "wellness")
    return "mt-0.5 block truncate text-xs font-normal text-sage-600";
  return "mt-0.5 block truncate text-xs font-normal text-zinc-500";
}

export function sidebarBrandStripClass(variant: DashboardShellVariant) {
  if (variant === "wellness") return "bg-white/25 backdrop-blur-sm";
  if (variant === "indigo") return "bg-indigo-50/30";
  return "bg-zinc-50/80";
}

/** Mobile drawer panel (matches desktop sidebar tone per variant). */
export function mobileDrawerPanelClass(variant: DashboardShellVariant) {
  if (variant === "admin" || variant === "member") {
    return "relative z-50 flex h-full w-[min(20rem,88vw)] max-w-full flex-col rounded-br-[40px] bg-[var(--ommm-admin-olive)] text-[var(--ommm-admin-cream)] shadow-[var(--ommm-admin-shadow-soft)]";
  }
  if (variant === "wellness") {
    return "relative z-50 flex h-full w-[min(20rem,88vw)] max-w-full flex-col border-r border-white/50 bg-white/90 shadow-xl backdrop-blur-md";
  }
  if (variant === "indigo") {
    return "relative z-50 flex h-full w-[min(20rem,88vw)] max-w-full flex-col border-r border-indigo-100 bg-white shadow-xl";
  }
  return "relative z-50 flex h-full w-[min(20rem,88vw)] max-w-full flex-col border-r border-zinc-200 bg-white shadow-xl";
}

export function mobileDrawerBrandTitleClass(variant: DashboardShellVariant) {
  if (variant === "admin" || variant === "member") {
    return "ommm-admin-sidebar-brand-title text-xl";
  }
  if (variant === "wellness") return "block truncate text-sm font-semibold text-sage-900";
  if (variant === "indigo") return "block truncate text-sm font-semibold text-indigo-950";
  return "block truncate text-sm font-semibold text-zinc-900";
}

export function mobileDrawerBrandSublineClass(variant: DashboardShellVariant) {
  if (variant === "admin" || variant === "member") return "ommm-admin-sidebar-brand-subline";
  if (variant === "wellness") return "block truncate text-xs text-sage-600";
  if (variant === "indigo") return "block truncate text-xs text-indigo-900/70";
  return "block truncate text-xs text-zinc-500";
}

export function mobileDrawerHeaderBorderClass(variant: DashboardShellVariant) {
  if (variant === "admin" || variant === "member") return "border-b border-white/15";
  return `border-b ${sidebarShellBorderClass(variant)}`;
}

export function mobileDrawerFooterClass(variant: DashboardShellVariant) {
  if (variant === "admin" || variant === "member") {
    return "shrink-0 space-y-3 border-t border-white/15 p-4";
  }
  if (variant === "wellness") {
    return "shrink-0 space-y-3 border-t border-white/50 p-4";
  }
  if (variant === "indigo") {
    return "shrink-0 space-y-3 border-t border-indigo-50 p-4";
  }
  return "shrink-0 space-y-3 border-t border-zinc-100 p-4";
}

export function mobileDrawerOverlayScrimClass(variant: DashboardShellVariant) {
  if (variant === "admin" || variant === "member")
    return "absolute inset-0 cursor-pointer bg-sage-900/45 transition-colors hover:bg-sage-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50";
  if (variant === "wellness")
    return "absolute inset-0 cursor-pointer bg-sage-900/35 transition-colors hover:bg-sage-900/42 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50";
  if (variant === "indigo")
    return "absolute inset-0 cursor-pointer bg-indigo-950/40 transition-colors hover:bg-indigo-950/48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50";
  return "absolute inset-0 cursor-pointer bg-zinc-900/40 transition-colors hover:bg-zinc-900/48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50";
}
