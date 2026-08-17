export type ScheduleView = "list" | "weekly" | "monthly";

export const SCHEDULE_VIEW_MODES: readonly ScheduleView[] = ["list", "weekly", "monthly"];

/** Card/list layout used on phones (week board is tablet+ only). */
export const SCHEDULE_MOBILE_CARD_VIEW: ScheduleView = "list";

/** Views that use the paginated list API + date-strip day counts. */
export function isScheduleListLikeView(view: ScheduleView): boolean {
  return view === "list" || view === "monthly";
}

/** Normalizes URL view params (including legacy `daily`) to supported schedule views. */
export function resolveScheduleView(value: string | undefined): ScheduleView {
  if (value === "weekly") return "weekly";
  if (value === "monthly") return "monthly";
  return "list";
}

/**
 * Phones always use card/list (or monthly day cards); week board is tablet+ only
 * (same breakpoint as {@link useSupportsListBoardView}).
 */
export function resolveEffectiveScheduleView(
  preferred: ScheduleView,
  supportsDesktopViews: boolean,
): ScheduleView {
  if (supportsDesktopViews) return preferred;
  if (preferred === "monthly") return "monthly";
  return SCHEDULE_MOBILE_CARD_VIEW;
}
