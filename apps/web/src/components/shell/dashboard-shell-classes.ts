import type { DashboardShellVariant } from "@/components/shell/dashboard-shell-types";

export function headerBarClass(variant: DashboardShellVariant) {
  if (variant === "indigo") return "border-indigo-100 bg-white";
  if (variant === "wellness")
    return "border-white/55 bg-white/55 shadow-sm backdrop-blur-md";
  return "border-zinc-200 bg-white";
}

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
    return "mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-white text-indigo-800 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 lg:inline-flex";
  if (variant === "wellness")
    return "mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-white/80 text-sage-700 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper lg:inline-flex";
  return "mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 lg:inline-flex";
}

export function pageBackgroundClass(variant: DashboardShellVariant) {
  if (variant === "indigo") return "min-h-screen bg-indigo-50/50";
  if (variant === "wellness") return "min-h-screen ommm-bg-wellness";
  return "min-h-screen bg-zinc-100";
}

export function menuButtonClass(variant: DashboardShellVariant) {
  if (variant === "indigo")
    return "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-white text-indigo-950 shadow-sm lg:hidden";
  if (variant === "wellness")
    return "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/70 bg-white/80 text-sage-800 shadow-sm backdrop-blur-sm lg:hidden";
  return "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-800 shadow-sm lg:hidden";
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
