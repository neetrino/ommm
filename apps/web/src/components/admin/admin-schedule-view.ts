export type ScheduleView = "list" | "weekly" | "monthly";

export const SCHEDULE_VIEW_MODES: readonly ScheduleView[] = ["list", "weekly", "monthly"];

/** Card/list layout used on phones when week board is unavailable. */
export const SCHEDULE_MOBILE_CARD_VIEW: ScheduleView = "list";

/** Views that use the paginated list API + date-strip day counts. */
export function isScheduleListLikeView(view: ScheduleView): boolean {
  return view === "list";
}

/** Normalizes URL view params (including legacy `daily`) to supported schedule views. */
export function resolveScheduleView(value: string | undefined): ScheduleView {
  if (value === "weekly") return "weekly";
  if (value === "monthly") return "monthly";
  return "list";
}

/**
 * List / week / month stay available on phones and desktop.
 * Week board scrolls horizontally on narrow viewports.
 */
export function resolveEffectiveScheduleView(
  preferred: ScheduleView,
  _supportsDesktopViews: boolean,
): ScheduleView {
  return preferred;
}
