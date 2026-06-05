import type { CSSProperties } from "react";
import { MARKETING_PAGE_CONTAINER_CLASS } from "@/components/marketing/marketing-content-layout";
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
  /** Mobile glass pill fill after scroll — Figma olive, slightly translucent. */
  scrolledPillBackground: "rgba(151, 144, 124, 0.72)",
  authIconGapPx: 6,
  actionsEdgeNudgePx: 4,
  menuEdgeNudgePx: 4,
  globeIconSizePx: 26,
  userIconWidthPx: 24,
  userIconHeightPx: 24,
  /** Matches `marketingHeaderContainerClass` mobile shell (pt + pb + row). */
  shellHeight:
    "calc(max(1rem, env(safe-area-inset-top, 0px)) + 0.75rem + 35px)",
} as const;

/** Scrolled liquid-glass pill — mobile header row wrap. */
export const MARKETING_MOBILE_HEADER_GLASS_PILL = {
  paddingY: "0.4375rem",
  paddingX: "1rem",
  /** Keep pill inside container — bleed caused asymmetric right clip on pages. */
  inlineBleed: "0",
  rowMinHeight: "2.625rem",
  menuIconSize: "2.25rem",
  brandFontSize: "1.25rem",
  brandLineHeight: "1.625rem",
  actionIconSize: "1.625rem",
  transitionDuration: "420ms",
  transitionEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

/**
 * Mobile shell height for USER account pages — header always uses the elevated glass pill
 * (`marketingHeaderContainerClass` pt + pb-3 + pill padding + pill row min-height).
 */
export const MARKETING_MOBILE_ACCOUNT_SHELL_HEIGHT = `calc(
  max(1rem, env(safe-area-inset-top, 0px)) + 0.75rem + calc(${MARKETING_MOBILE_HEADER_GLASS_PILL.paddingY} * 2) + ${MARKETING_MOBILE_HEADER_GLASS_PILL.rowMinHeight}
)`;

/** Animated CSS vars for the mobile header row wrap (hero ↔ glass pill). */
export function marketingHeaderMobileRowWrapStyle(glassActive: boolean): CSSProperties {
  const pill = MARKETING_MOBILE_HEADER_GLASS_PILL;
  const base = MARKETING_MOBILE_HEADER;
  return {
    ["--marketing-mobile-glass-pill-py" as string]: glassActive ? pill.paddingY : "0",
    ["--marketing-mobile-glass-pill-px" as string]: glassActive ? pill.paddingX : "0",
    ["--marketing-mobile-glass-pill-inline-bleed" as string]: glassActive ? pill.inlineBleed : "0",
    ["--marketing-mobile-glass-pill-row-min-height" as string]: glassActive
      ? pill.rowMinHeight
      : `${base.rowHeightPx}px`,
    ["--marketing-mobile-glass-pill-menu-icon-size" as string]: glassActive
      ? pill.menuIconSize
      : `${base.menuIconSizePx}px`,
    ["--marketing-mobile-glass-pill-brand-size" as string]: glassActive
      ? pill.brandFontSize
      : `${base.brandFontSizePx}px`,
    ["--marketing-mobile-glass-pill-brand-line-height" as string]: glassActive
      ? pill.brandLineHeight
      : `${base.brandLineHeightPx}px`,
    ["--marketing-mobile-glass-pill-action-icon-size" as string]: glassActive
      ? pill.actionIconSize
      : `${base.globeIconSizePx}px`,
    ["--marketing-mobile-glass-pill-transition-duration" as string]: pill.transitionDuration,
    ["--marketing-mobile-glass-pill-transition-easing" as string]: pill.transitionEasing,
  };
}

/** Figma TopNavBar `196:1410` sizing tokens. */
const MARKETING_NAV_PILL_HEIGHT_CLASS =
  "h-[40px] min-h-[40px] lg:h-[44px] lg:min-h-[44px] nav-desktop:h-[53px] nav-desktop:min-h-[53px]";
const MARKETING_NAV_PILL_RADIUS_CLASS = "rounded-[80px]";
/** Figma TopNavBar `88:3724` — px 30; slightly wider than previous px-5. */
const MARKETING_NAV_PILL_PADDING_X_CLASS = "px-2 lg:px-3 nav-desktop:px-[30px] nav-desktop:xl:px-9";
/** Figma link spacing `88:3730` — 48px between items. */
const MARKETING_NAV_LINK_GAP_CLASS = "gap-3 lg:gap-4 nav-desktop:gap-12";
const MARKETING_NAV_LINK_GAP_COMPACT_CLASS =
  "gap-1 sm:gap-2 md:gap-2.5 lg:gap-3 nav-desktop:gap-4 xl:gap-5";

/** Locales whose nav labels are longer than English — use tighter header spacing. */
const COMPACT_HEADER_LOCALES = new Set(["hy", "ru"]);

/** Header ink — driven by `--ommm-marketing-header-ink*` on `.headerShell`. */
const MARKETING_HEADER_INK = "text-[var(--ommm-marketing-header-ink)]";
const MARKETING_HEADER_INK_HOVER_SURFACE =
  "hover:bg-[var(--ommm-marketing-header-ink-hover-surface)]";
const MARKETING_HEADER_FOCUS_RING =
  "focus-visible:ring-[var(--ommm-marketing-header-focus-ring)]";
const MARKETING_HEADER_INK_TRANSITION = "transition-[color,background-color] duration-220";

const MARKETING_NAV_INK = "text-[var(--ommm-marketing-nav-ink)]";
const MARKETING_NAV_INK_ACTIVE = "text-[var(--ommm-marketing-nav-ink-active)]";
const MARKETING_NAV_INK_HOVER = "hover:text-[var(--ommm-marketing-nav-ink-hover)]";

export function isCompactMarketingHeaderLocale(locale: string): boolean {
  return COMPACT_HEADER_LOCALES.has(locale);
}

export function marketingHeaderShellClass(): string {
  return [
    "fixed top-0 left-0 right-0 z-50 w-full min-w-0 overflow-x-clip",
    "bg-transparent",
    marketingMontserrat.variable,
  ].join(" ");
}

/** Pull full-bleed hero surfaces under the fixed mobile header (legacy — header is fixed on all breakpoints). */
export function marketingFullBleedHeroHeaderOverlapClass(): string {
  return "max-tablet:-mt-[var(--marketing-mobile-header-height)]";
}

export function marketingHeaderContainerClass(): string {
  return [
    `${MARKETING_PAGE_CONTAINER_CLASS} relative min-w-0`,
    "pb-3 pt-[max(1rem,env(safe-area-inset-top,0px))]",
    "tablet:grid tablet:min-h-[40px] lg:min-h-[44px] nav-desktop:min-h-[53px] tablet:items-center",
    "tablet:pb-2 lg:pb-3",
    "tablet:pt-[max(0.5rem,env(safe-area-inset-top,0px))] nav-desktop:pt-[max(0.75rem,env(safe-area-inset-top,0px))]",
    "tablet:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] tablet:gap-1.5 lg:gap-2 nav-desktop:gap-3 sm:gap-4",
  ].join(" ");
}

export function marketingHeaderMobileRowWrapClass(): string {
  return "w-full min-w-0 tablet:hidden";
}

export function marketingHeaderMobileRowInnerClass(): string {
  return "relative z-10 flex w-full items-center justify-between";
}

export function marketingHeaderMobileBrandTextClass(): string {
  return [
    "font-serif font-bold tracking-[-0.05em]",
    "whitespace-nowrap",
    MARKETING_HEADER_INK,
    MARKETING_HEADER_INK_TRANSITION,
  ].join(" ");
}

export function marketingHeaderMobileMenuButtonClass(menuOpen: boolean): string {
  const iconColor = menuOpen ? "text-sage-900" : MARKETING_HEADER_INK;
  const focusRing = menuOpen
    ? "focus-visible:ring-sage-700/30"
    : MARKETING_HEADER_FOCUS_RING;

  return [
    "inline-flex shrink-0 cursor-pointer items-center justify-center",
    iconColor,
    MARKETING_HEADER_INK_TRANSITION,
    "rounded-full transition-[transform]",
    menuOpen
      ? "hover:bg-sage-900/10 active:scale-[0.96]"
      : `${MARKETING_HEADER_INK_HOVER_SURFACE} active:scale-[0.96]`,
    "focus-visible:outline-none focus-visible:ring-2",
    focusRing,
    "focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  ].join(" ");
}

export function marketingHeaderMobileActionsClass(): string {
  return "flex shrink-0 items-center gap-[6px] overflow-visible";
}

export function marketingHeaderMobileBrandLinkClass(): string {
  return [
    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    "flex shrink-0 items-center",
  ].join(" ");
}

export function marketingHeaderBrandLinkClass(): string {
  return "hidden tablet:flex justify-self-start min-w-0 shrink-0 items-center";
}

export function marketingHeaderBrandTextClass(): string {
  return [
    "font-serif text-lg font-bold leading-6 tracking-[-0.05em]",
    MARKETING_HEADER_INK,
    MARKETING_HEADER_INK_TRANSITION,
    "lg:text-xl lg:leading-7",
    "nav-desktop:text-2xl nav-desktop:leading-8",
    "whitespace-nowrap",
  ].join(" ");
}

export function marketingHeaderNavClass(compact: boolean): string {
  const pillPadding = compact
    ? "px-2 sm:px-3 nav-desktop:px-6 nav-desktop:xl:px-8"
    : MARKETING_NAV_PILL_PADDING_X_CLASS;

  return [
    "relative isolate hidden min-w-0 max-w-full justify-self-center overflow-hidden tablet:flex tablet:items-center tablet:justify-center",
    MARKETING_NAV_PILL_HEIGHT_CLASS,
    MARKETING_NAV_PILL_RADIUS_CLASS,
    marketingMontserrat.className,
    pillPadding,
  ].join(" ");
}

export function marketingHeaderNavLinksClass(compact: boolean): string {
  const linkGap = compact ? MARKETING_NAV_LINK_GAP_COMPACT_CLASS : MARKETING_NAV_LINK_GAP_CLASS;

  return [
    "relative z-10 flex h-full min-h-[40px] lg:min-h-[44px] nav-desktop:min-h-[53px] items-center justify-center",
    linkGap,
  ].join(" ");
}

export function marketingHeaderActionsClass(): string {
  return "hidden tablet:flex justify-self-end shrink-0 items-center gap-1.5 overflow-visible lg:gap-2 nav-desktop:gap-3 sm:gap-4";
}

/** Figma `196:1453` globe + `196:1451` user — grouped at header trailing edge. */
export function marketingHeaderAuthClusterClass(): string {
  return "flex shrink-0 items-center gap-1 overflow-visible";
}

/** Burger menu nav links — solid white panel; always en-sized type (panel has room). */
export function marketingHeaderMobileMenuNavLinkClass(active: boolean): string {
  return [
    "whitespace-nowrap text-base font-bold leading-5 tracking-[-0.35px]",
    "rounded-xl px-3 py-2.5 text-sage-800",
    active ? "bg-sage-100 text-sage-900" : "hover:bg-sage-50",
    "transition-[color,background-color] duration-250",
  ].join(" ");
}

export function marketingHeaderNavLinkClass(
  active: boolean,
  compact: boolean,
): string {
  const typography = compact
    ? "whitespace-nowrap text-[11px] font-bold leading-5 tracking-[-0.35px] sm:text-xs md:text-sm nav-desktop:text-base"
    : "whitespace-nowrap text-xs font-bold leading-5 tracking-[-0.35px] lg:text-sm nav-desktop:text-base";

  const state = active
    ? MARKETING_NAV_INK_ACTIVE
    : `${MARKETING_NAV_INK} hover:bg-[var(--ommm-marketing-header-ink-hover-surface)] ${MARKETING_NAV_INK_HOVER}`;

  return [
    typography,
    "rounded-xl px-3 py-2.5",
    state,
    MARKETING_HEADER_INK_TRANSITION,
  ].join(" ");
}

/** Nav links inside TopNavBar pill — Figma `88:3728` active / `88:3730` default. */
export function marketingHeaderNavPillLinkClass(
  active: boolean,
  compact: boolean,
): string {
  const typography = compact
    ? "whitespace-nowrap text-[11px] font-bold leading-none tracking-[-0.35px] sm:text-xs md:text-sm nav-desktop:text-base"
    : "whitespace-nowrap text-xs font-bold leading-none tracking-[-0.35px] lg:text-sm nav-desktop:text-base";

  const state = active ? MARKETING_NAV_INK_ACTIVE : `${MARKETING_NAV_INK} ${MARKETING_NAV_INK_HOVER}`;

  return [
    typography,
    state,
    MARKETING_HEADER_INK_TRANSITION,
    "duration-300 ease-out motion-reduce:transition-none",
  ].join(" ");
}

export function marketingHeaderIconButtonClass(): string {
  return [
    "inline-flex cursor-pointer items-center justify-center rounded-full",
    MARKETING_HEADER_INK,
    MARKETING_HEADER_INK_TRANSITION,
    `duration-250 ${MARKETING_HEADER_INK_HOVER_SURFACE} hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]`,
    "transition-[box-shadow]",
    "focus-visible:outline-none focus-visible:ring-2",
    MARKETING_HEADER_FOCUS_RING,
    "focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  ].join(" ");
}

export function marketingHeaderIconLanguageClass(): string {
  return `${marketingHeaderIconButtonClass()} h-8 w-8 lg:h-9 lg:w-9 nav-desktop:h-11 nav-desktop:w-11`;
}

export function marketingHeaderIconAccountClass(): string {
  return `${marketingHeaderIconButtonClass()} h-8 w-8 lg:h-9 lg:w-9 nav-desktop:h-11 nav-desktop:w-11`;
}

export function marketingHeaderMenuButtonClass(): string {
  return marketingHeaderMobileMenuButtonClass(false);
}

export function marketingHeaderMobileLanguageTriggerClass(): string {
  return [
    "ommm-dropdown-trigger !justify-center !gap-0 !border-0 !bg-transparent !p-0 !shadow-none !backdrop-blur-none",
    `${MARKETING_HEADER_INK} cursor-pointer`,
    MARKETING_HEADER_INK_TRANSITION,
    "hover:!border-0 hover:!bg-transparent hover:!shadow-none",
    "data-[open=true]:!border-0 data-[open=true]:!bg-transparent data-[open=true]:!shadow-none data-[open=true]:!ring-0",
    "focus-visible:outline-none focus-visible:ring-2",
    MARKETING_HEADER_FOCUS_RING,
    "focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  ].join(" ");
}

export function marketingHeaderMobileIconAccountClass(): string {
  return [
    marketingHeaderIconButtonClass(),
    "inline-flex items-center justify-center",
  ].join(" ");
}

export function marketingHeaderLanguageTriggerClass(): string {
  return [
    "ommm-dropdown-trigger !h-8 !min-h-8 !w-8 !min-w-8 lg:!h-9 lg:!min-h-9 lg:!w-9 lg:!min-w-9 nav-desktop:!h-11 nav-desktop:!min-h-11 nav-desktop:!w-11 nav-desktop:!min-w-11 !justify-center !gap-0 !border-0 !bg-transparent !p-0 !shadow-none !backdrop-blur-none",
    `${MARKETING_HEADER_INK} cursor-pointer`,
    MARKETING_HEADER_INK_TRANSITION,
    "hover:!border-0 hover:!bg-transparent hover:!shadow-none",
    "data-[open=true]:!border-0 data-[open=true]:!bg-transparent data-[open=true]:!shadow-none data-[open=true]:!ring-0",
    "focus-visible:outline-none focus-visible:ring-2",
    MARKETING_HEADER_FOCUS_RING,
    "focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  ].join(" ");
}
