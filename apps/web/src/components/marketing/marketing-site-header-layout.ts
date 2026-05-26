/** Locales whose nav labels are longer than English — use tighter header spacing. */
const COMPACT_HEADER_LOCALES = new Set(["hy", "ru"]);

export function isCompactMarketingHeaderLocale(locale: string): boolean {
  return COMPACT_HEADER_LOCALES.has(locale);
}

export function marketingHeaderShellClass(): string {
  return [
    "fixed left-0 right-0 top-0 z-50 w-full min-w-0 overflow-x-clip",
    "pt-[env(safe-area-inset-top,0px)]",
    "bg-transparent backdrop-blur-sm",
  ].join(" ");
}

export function marketingHeaderContainerClass(compact: boolean): string {
  if (!compact) {
    return "ommm-container flex h-16 min-w-0 items-center justify-between gap-4 overflow-x-clip sm:h-20";
  }

  return [
    "ommm-container grid h-16 min-w-0",
    "grid-cols-[auto_minmax(0,1fr)_auto]",
    "items-center gap-2 overflow-x-clip sm:h-20 sm:gap-3",
  ].join(" ");
}

export function marketingHeaderBrandLinkClass(compact: boolean): string {
  return compact
    ? "flex min-w-0 shrink-0 items-center"
    : "flex shrink-0 items-center";
}

export function marketingHeaderBrandTextClass(compact: boolean): string {
  const base =
    "font-sans text-xl font-semibold tracking-tight text-white sm:text-2xl";
  return compact ? `truncate ${base}` : base;
}

export function marketingHeaderNavClass(compact: boolean): string {
  if (!compact) {
    return [
      "hidden min-w-0 shrink items-center gap-10 overflow-hidden",
      "lg:flex",
    ].join(" ");
  }

  return [
    "hidden min-w-0 max-w-full items-center justify-center justify-self-center lg:flex",
    "gap-0.5 sm:gap-1 lg:gap-1.5 xl:gap-2 2xl:gap-3",
  ].join(" ");
}

export function marketingHeaderActionsClass(compact: boolean): string {
  if (!compact) {
    return "ml-auto flex shrink-0 items-center gap-2 sm:gap-3 lg:ml-0";
  }

  return "flex shrink-0 items-center justify-self-end gap-1.5 sm:gap-2 lg:gap-3";
}

export function marketingHeaderNavLinkClass(
  active: boolean,
  compact: boolean,
): string {
  if (!compact) {
    return [
      "rounded-full px-3 py-2 text-base font-light transition-colors",
      active
        ? "border-b-2 border-[rgba(250,204,21,0.5)] pb-1.5 text-white"
        : "text-white hover:bg-white/10",
    ].join(" ");
  }

  const sizing =
    "whitespace-nowrap rounded-full px-1 py-2 text-[11px] font-light sm:px-1.5 sm:text-xs lg:px-2 lg:text-sm xl:px-2.5 xl:text-[15px] 2xl:px-3 2xl:text-base";
  const state = active
    ? "border-b-2 border-[rgba(250,204,21,0.5)] pb-1.5 text-white"
    : "text-white hover:bg-white/10";

  return [sizing, state, "transition-colors"].join(" ");
}

export function marketingHeaderBookClass(compact: boolean): string {
  if (!compact) {
    return [
      "hidden shrink-0 rounded-full bg-[#e8da74] font-medium text-white shadow-sm",
      "whitespace-nowrap md:max-lg:inline-flex md:px-5 md:py-2.5 md:text-sm",
      "lg:inline-flex lg:px-8 lg:py-3",
      "transition-[filter,transform] hover:brightness-105",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
      "focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
    ].join(" ");
  }

  return [
    "hidden shrink-0 rounded-full bg-[#e8da74] font-medium text-white shadow-sm",
    "whitespace-nowrap md:max-lg:inline-flex md:px-2.5 md:py-2 md:text-[10px]",
    "lg:inline-flex lg:px-3 lg:py-2.5 lg:text-[11px]",
    "xl:px-4 xl:py-3 xl:text-xs 2xl:px-5 2xl:text-sm",
    "transition-[filter,transform] hover:brightness-105",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  ].join(" ");
}

export function marketingHeaderMenuButtonClass(): string {
  return [
    "inline-flex h-11 w-11 items-center justify-center rounded-full",
    "border border-white/50 bg-white/10 text-white shadow-sm lg:hidden",
  ].join(" ");
}

export function marketingHeaderMobilePanelClass(open: boolean): string {
  if (!open) return "hidden";
  return "border-t border-white/30 bg-black/30 px-4 py-4 backdrop-blur-xl lg:hidden";
}
