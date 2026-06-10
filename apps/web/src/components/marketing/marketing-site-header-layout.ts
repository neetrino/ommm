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
  /** Header profile avatar — slightly smaller than globe/action icons. */
  avatarInsetPx: 3,
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

/** Figma TopNavBar `442:1877` — unified desktop bar sizing tokens. */
export const MARKETING_DESKTOP_NAV = {
  barHeightPx: 53,
  barRadiusPx: 80,
  brandPaddingLeftPx: 41,
  actionsPaddingRightPx: 30,
  brandFontSizePx: 24,
  brandLineHeightPx: 32,
  linkFontSizePx: 18,
  linkLineHeightPx: 20,
  linkGapPx: 48,
  linkActiveBorderWidthPx: 2,
  linkActivePaddingBottomPx: 6,
  iconGapPx: 9,
  globeSizePx: 32,
  userWidthPx: 26,
  userHeightPx: 30,
} as const;

const MARKETING_DESKTOP_BAR_HEIGHT_CLASS =
  "h-[40px] min-h-[40px] lg:h-[44px] lg:min-h-[44px] nav-desktop:h-[53px] nav-desktop:min-h-[53px]";
const MARKETING_DESKTOP_BAR_RADIUS_CLASS = "rounded-[80px]";
/** Figma link spacing `442:1883` — 48px between items. */
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
    "tablet:pb-2 lg:pb-3",
    "tablet:pt-[max(0.5rem,env(safe-area-inset-top,0px))] nav-desktop:pt-[max(0.75rem,env(safe-area-inset-top,0px))]",
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

/** Desktop header — always full-width glass pill (brand + nav + actions). */
export function marketingHeaderDesktopRowClass(): string {
  return [
    "relative isolate hidden min-w-0 overflow-hidden tablet:grid",
    MARKETING_DESKTOP_BAR_HEIGHT_CLASS,
    MARKETING_DESKTOP_BAR_RADIUS_CLASS,
    "grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center",
    "pl-4 pr-3 lg:pl-6 lg:pr-4 nav-desktop:pl-[41px] nav-desktop:pr-[30px]",
    "tablet:gap-1.5 lg:gap-2 nav-desktop:gap-3",
  ].join(" ");
}

export function marketingHeaderDesktopBrandLinkClass(): string {
  return "relative z-10 flex h-full min-w-0 shrink-0 items-center justify-center justify-self-start self-center";
}

export function marketingHeaderDesktopBrandTextClass(): string {
  return [
    "font-serif font-bold tracking-[-0.05em] whitespace-nowrap leading-none",
    MARKETING_HEADER_INK,
    MARKETING_HEADER_INK_TRANSITION,
    "text-lg lg:text-xl nav-desktop:text-2xl",
  ].join(" ");
}

export function marketingHeaderDesktopNavClass(): string {
  return "relative z-10 flex h-full min-w-0 items-center justify-center justify-self-center";
}

export function marketingHeaderNavLinksClass(compact: boolean): string {
  const linkGap = compact ? MARKETING_NAV_LINK_GAP_COMPACT_CLASS : MARKETING_NAV_LINK_GAP_CLASS;

  return ["flex h-full items-center justify-center", linkGap].join(" ");
}

export function marketingHeaderDesktopActionsClass(): string {
  return "relative z-10 flex h-full shrink-0 items-center justify-center justify-self-end self-center gap-1.5 overflow-visible lg:gap-2 nav-desktop:gap-[9px]";
}

/** Figma `442:1897` — globe + user grouped at bar trailing edge. */
export function marketingHeaderAuthClusterClass(): string {
  return "flex shrink-0 items-center gap-1 overflow-visible nav-desktop:gap-[9px]";
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

/** Nav links inside TopNavBar — Figma `442:1881` active / `442:1883` default. */
export function marketingHeaderNavPillLinkClass(
  active: boolean,
  compact: boolean,
): string {
  const typography = compact
    ? "whitespace-nowrap font-serif text-[11px] font-bold leading-none tracking-[-0.35px] sm:text-xs md:text-sm nav-desktop:text-lg"
    : "whitespace-nowrap font-serif text-xs font-bold leading-none tracking-[-0.35px] lg:text-sm nav-desktop:text-lg";

  const state = active ? MARKETING_NAV_INK_ACTIVE : `${MARKETING_NAV_INK} ${MARKETING_NAV_INK_HOVER}`;

  return [typography, state, "motion-reduce:transition-none"].join(" ");
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
  return [
    marketingHeaderIconButtonClass(),
    "inline-flex items-center justify-center !p-0",
    "h-8 w-8 min-h-8 min-w-8 lg:h-9 lg:w-9 lg:min-h-9 lg:min-w-9 nav-desktop:h-8 nav-desktop:w-8 nav-desktop:min-h-8 nav-desktop:min-w-8",
  ].join(" ");
}

/** Desktop header action icons — globe, login. */
export const MARKETING_HEADER_DESKTOP_ACTION_ICON_CLASS =
  "h-6 w-6 shrink-0 lg:h-7 lg:w-7 nav-desktop:h-8 nav-desktop:w-8";

/** Desktop header avatar — globe minus `MARKETING_MOBILE_HEADER.avatarInsetPx` at each tier. */
export const MARKETING_HEADER_DESKTOP_AVATAR_CLASS =
  "h-[21px] w-[21px] shrink-0 lg:h-[25px] lg:w-[25px] nav-desktop:h-[29px] nav-desktop:w-[29px]";

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

const MARKETING_HEADER_FLAT_ACTION_TRIGGER_CLASS = [
  "!h-8 !min-h-8 !w-8 !min-w-8 lg:!h-9 lg:!min-h-9 lg:!w-9 lg:!min-w-9 nav-desktop:!h-8 nav-desktop:!min-h-8 nav-desktop:!w-8 nav-desktop:!min-w-8",
  "!justify-center !gap-0 !border-0 !bg-transparent !p-0 !shadow-none !backdrop-blur-none",
  `${MARKETING_HEADER_INK} cursor-pointer`,
  MARKETING_HEADER_INK_TRANSITION,
  "hover:!border-0 hover:!bg-transparent hover:!shadow-none active:!bg-transparent active:!ring-0",
  "focus-visible:outline-none focus-visible:ring-2",
  MARKETING_HEADER_FOCUS_RING,
  "focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
].join(" ");

export function marketingHeaderLanguageTriggerClass(): string {
  return [
    "ommm-dropdown-trigger",
    MARKETING_HEADER_FLAT_ACTION_TRIGGER_CLASS,
    "!h-9 !min-h-9 !w-7 !min-w-7 lg:!h-10 lg:!min-h-10 lg:!w-8 lg:!min-w-8 nav-desktop:!h-9 nav-desktop:!min-h-9 nav-desktop:!w-7 nav-desktop:!min-w-7",
    "data-[open=true]:!border-0 data-[open=true]:!bg-transparent data-[open=true]:!shadow-none data-[open=true]:!ring-0",
  ].join(" ");
}

/** Notification bell — flat trigger, same footprint as globe. */
export function marketingHeaderNotificationTriggerClass(): string {
  return ["inline-flex items-center", MARKETING_HEADER_FLAT_ACTION_TRIGGER_CLASS].join(" ");
}
