import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

/** Figma mobile HEADER `97:5670` sizing tokens. */
export const MARKETING_MOBILE_HEADER = {
  paddingXPx: 16,
  paddingTopPx: 16,
  rowHeightPx: 35,
  menuIconSizePx: 35,
  brandFontSizePx: 20,
  brandLineHeightPx: 28,
  brandColor: "#fbf5d5",
  authIconGapPx: 6,
  actionsEdgeNudgePx: 4,
  menuEdgeNudgePx: 4,
  globeIconSizePx: 26,
  userIconWidthPx: 24,
  userIconHeightPx: 24,
} as const;

/** Figma TopNavBar `196:1410` sizing tokens. */
const MARKETING_NAV_PILL_HEIGHT_CLASS = "min-h-[53px]";
const MARKETING_NAV_PILL_RADIUS_CLASS = "rounded-[80px]";
const MARKETING_NAV_PILL_PADDING_X_CLASS = "px-5";
const MARKETING_NAV_LINK_GAP_CLASS = "gap-8";
const MARKETING_NAV_LINK_GAP_COMPACT_CLASS =
  "gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5";

/** Locales whose nav labels are longer than English — use tighter header spacing. */
const COMPACT_HEADER_LOCALES = new Set(["hy", "ru"]);

export function isCompactMarketingHeaderLocale(locale: string): boolean {
  return COMPACT_HEADER_LOCALES.has(locale);
}

export function marketingHeaderShellClass(): string {
  return [
    "fixed left-0 right-0 top-0 z-50 w-full min-w-0 overflow-x-clip",
    "bg-transparent",
    marketingMontserrat.variable,
  ].join(" ");
}

export function marketingHeaderContainerClass(): string {
  return [
    "ommm-container relative min-w-0 overflow-x-clip",
    "pb-3 pt-[max(1rem,env(safe-area-inset-top,0px))] px-4",
    "lg:grid lg:min-h-[53px] lg:items-center",
    "lg:px-[var(--ommm-container-padding-x,1rem)]",
    "lg:pt-[max(0.75rem,env(safe-area-inset-top,0px))]",
    "lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-3 sm:gap-4",
  ].join(" ");
}

export function marketingHeaderMobileRowClass(): string {
  return "relative flex min-h-[35px] w-full items-center justify-between lg:hidden";
}

export function marketingHeaderMobileBrandLinkClass(): string {
  return [
    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    "flex shrink-0 items-center",
  ].join(" ");
}

export function marketingHeaderMobileBrandTextClass(): string {
  return [
    "font-serif text-[20px] font-bold leading-7 tracking-[-0.05em]",
    "whitespace-nowrap text-[#fbf5d5]",
  ].join(" ");
}

export function marketingHeaderMobileMenuButtonClass(): string {
  return [
    "ml-[-4px] inline-flex shrink-0 cursor-pointer items-center justify-center",
    "h-[35px] w-[35px] text-[#fbf5d5]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  ].join(" ");
}

export function marketingHeaderMobileActionsClass(): string {
  return "mr-[-4px] flex shrink-0 items-center gap-[6px]";
}

export function marketingHeaderBrandLinkClass(): string {
  return "hidden lg:flex justify-self-start min-w-0 shrink-0 items-center";
}

export function marketingHeaderBrandTextClass(): string {
  return [
    "font-serif text-2xl font-bold leading-8 tracking-[-0.05em] text-[#fbf5d5]",
    "whitespace-nowrap",
  ].join(" ");
}

export function marketingHeaderNavClass(compact: boolean): string {
  const pillPadding = compact ? "px-3 sm:px-4 md:px-5" : MARKETING_NAV_PILL_PADDING_X_CLASS;

  return [
    "relative isolate hidden min-w-0 max-w-full justify-self-center overflow-hidden lg:flex",
    MARKETING_NAV_PILL_HEIGHT_CLASS,
    MARKETING_NAV_PILL_RADIUS_CLASS,
    marketingMontserrat.className,
    pillPadding,
  ].join(" ");
}

export function marketingHeaderNavLinksClass(compact: boolean): string {
  const linkGap = compact ? MARKETING_NAV_LINK_GAP_COMPACT_CLASS : MARKETING_NAV_LINK_GAP_CLASS;

  return [
    "relative z-10 flex min-h-[53px] items-center justify-center",
    linkGap,
  ].join(" ");
}

export function marketingHeaderActionsClass(): string {
  return "hidden lg:flex justify-self-end shrink-0 items-center gap-3 sm:gap-4";
}

/** Figma `196:1453` globe + `196:1451` user — grouped at header trailing edge. */
export function marketingHeaderAuthClusterClass(): string {
  return "flex shrink-0 items-center gap-1";
}

export function marketingHeaderNavLinkClass(
  active: boolean,
  compact: boolean,
): string {
  const typography = compact
    ? "whitespace-nowrap text-[11px] font-bold leading-5 tracking-[-0.35px] sm:text-xs md:text-sm lg:text-base"
    : "whitespace-nowrap text-base font-bold leading-5 tracking-[-0.35px]";

  const state = active
    ? "text-[#fbf5d5]"
    : "text-white hover:bg-white/8 hover:text-white";

  return [
    typography,
    "rounded-xl px-3 py-2.5",
    state,
    "transition-[color,background-color] duration-250",
  ].join(" ");
}

/** Nav links inside TopNavBar pill — Figma `196:1414` active / `196:1417` default. */
export function marketingHeaderNavPillLinkClass(
  active: boolean,
  compact: boolean,
): string {
  const typography = compact
    ? "whitespace-nowrap text-[11px] font-bold leading-5 tracking-[-0.35px] sm:text-xs md:text-sm lg:text-base"
    : "whitespace-nowrap text-base font-bold leading-5 tracking-[-0.35px]";

  const state = active
    ? "text-[#fbf5d5]"
    : "text-white hover:bg-white/8 hover:text-white";

  return [
    typography,
    "rounded-full px-1.5 py-1.5",
    state,
    "transition-[color,background-color] duration-250",
  ].join(" ");
}

export function marketingHeaderIconButtonClass(): string {
  return [
    "inline-flex cursor-pointer items-center justify-center rounded-full text-[#fbf5d5]",
    "transition-[color,background-color,box-shadow] duration-250 hover:bg-white/12 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  ].join(" ");
}

export function marketingHeaderIconLanguageClass(): string {
  return `${marketingHeaderIconButtonClass()} h-11 w-11`;
}

export function marketingHeaderIconAccountClass(): string {
  return `${marketingHeaderIconButtonClass()} h-11 w-11`;
}

export function marketingHeaderMenuButtonClass(): string {
  return marketingHeaderMobileMenuButtonClass();
}

export function marketingHeaderMobilePanelClass(open: boolean): string {
  if (!open) return "hidden";
  return ["lg:hidden", marketingMontserrat.className].join(" ");
}

export function marketingHeaderMobileLanguageTriggerClass(): string {
  return [
    "ommm-dropdown-trigger !h-[26px] !min-h-[26px] !w-[26px] !min-w-[26px] !justify-center !gap-0 !border-0 !bg-transparent !p-0 !shadow-none !backdrop-blur-none",
    "text-[#fbf5d5] cursor-pointer",
    "hover:!border-0 hover:!bg-transparent hover:!shadow-none",
    "data-[open=true]:!border-0 data-[open=true]:!bg-transparent data-[open=true]:!shadow-none data-[open=true]:!ring-0",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  ].join(" ");
}

export function marketingHeaderMobileIconAccountClass(): string {
  return [
    marketingHeaderIconButtonClass(),
    "inline-flex h-[26px] w-[26px] items-center justify-center",
  ].join(" ");
}

export function marketingHeaderLanguageTriggerClass(): string {
  return [
    "ommm-dropdown-trigger !h-11 !min-h-11 !w-11 !min-w-11 !justify-center !gap-0 !border-0 !bg-transparent !p-0 !shadow-none !backdrop-blur-none",
    "text-[#fbf5d5] cursor-pointer",
    "hover:!border-0 hover:!bg-transparent hover:!shadow-none",
    "data-[open=true]:!border-0 data-[open=true]:!bg-transparent data-[open=true]:!shadow-none data-[open=true]:!ring-0",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  ].join(" ");
}
