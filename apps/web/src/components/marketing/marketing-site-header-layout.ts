import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

/** Locales whose nav labels are longer than English — use tighter header spacing. */
const COMPACT_HEADER_LOCALES = new Set(["hy", "ru"]);

export function isCompactMarketingHeaderLocale(locale: string): boolean {
  return COMPACT_HEADER_LOCALES.has(locale);
}

export function marketingHeaderShellClass(): string {
  return [
    "fixed left-0 right-0 top-0 z-50 w-full min-w-0 overflow-x-clip",
    "pt-[env(safe-area-inset-top,0px)]",
    "bg-transparent",
    marketingMontserrat.variable,
  ].join(" ");
}

export function marketingHeaderContainerClass(): string {
  return [
    "ommm-container grid min-h-[53px] min-w-0 items-center overflow-x-clip py-3",
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
  const pillPadding = compact ? "px-3 sm:px-4 md:px-5" : "px-[30px]";

  return [
    "relative isolate hidden min-h-[53px] min-w-0 max-w-full justify-self-center overflow-hidden lg:flex",
    "rounded-[80px] border border-white/45 ring-1 ring-white/30 backdrop-blur-xl backdrop-saturate-150",
    marketingMontserrat.className,
    pillPadding,
  ].join(" ");
}

export function marketingHeaderNavPillGlossClass(): string {
  return "pointer-events-none absolute inset-0 rounded-[inherit]";
}

export function marketingHeaderNavLinksClass(compact: boolean): string {
  const linkGap = compact
    ? "gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5"
    : "gap-12";

  return ["relative z-10 flex min-h-[53px] items-center justify-center", linkGap].join(
    " ",
  );
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
    : "text-white hover:bg-white/10 hover:text-white";

  return [typography, state, "transition-colors"].join(" ");
}

export function marketingHeaderIconButtonClass(): string {
  return [
    "inline-flex cursor-pointer items-center justify-center rounded-full text-[#fbf5d5]",
    "transition-colors hover:bg-white/10",
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
    "border border-white/50 bg-white/10 text-white shadow-sm",
    "transition-colors hover:bg-white/15",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  ].join(" ");
}

export function marketingHeaderMobilePanelClass(open: boolean): string {
  if (!open) return "hidden";
  return ["px-4 py-4 lg:hidden", marketingMontserrat.className].join(" ");
}

export function marketingHeaderLanguageTriggerClass(): string {
  return [
    "ommm-dropdown-trigger !h-11 !min-h-11 !w-11 !min-w-11 !justify-center !gap-0 !border-0 !bg-transparent !p-0 !shadow-none !backdrop-blur-none",
    "text-[#fbf5d5] cursor-pointer hover:!border-0 hover:!bg-transparent hover:!shadow-none",
    "data-[open=true]:!border-0 data-[open=true]:!bg-transparent data-[open=true]:!shadow-none data-[open=true]:!ring-0",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  ].join(" ");
}
