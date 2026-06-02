import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

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
    "ommm-container grid min-h-[53px] min-w-0 items-center overflow-x-clip",
    "pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]",
    "grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-3 sm:gap-4",
  ].join(" ");
}

export function marketingHeaderBrandLinkClass(): string {
  return "justify-self-start flex min-w-0 shrink-0 items-center";
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
  return "justify-self-end flex shrink-0 items-center gap-3 sm:gap-4";
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
  return [
    "inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full lg:hidden",
    "text-white",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  ].join(" ");
}

export function marketingHeaderMobilePanelClass(open: boolean): string {
  if (!open) return "hidden";
  return ["lg:hidden", marketingMontserrat.className].join(" ");
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
