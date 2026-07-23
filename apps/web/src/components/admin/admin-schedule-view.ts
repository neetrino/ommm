export type ScheduleView = "list" | "weekly";

export const SCHEDULE_VIEW_MODES: readonly ScheduleView[] = ["list", "weekly"];

/** Card/list layout used on phones (week board is tablet+ only). */
export const SCHEDULE_MOBILE_CARD_VIEW: ScheduleView = "list";

/** Normalizes legacy URL view params (monthly/daily) to supported schedule views. */
export function resolveScheduleView(value: string | undefined): ScheduleView {
  return value === "weekly" ? "weekly" : "list";
}

/**
 * Phones always use card/list view; list/week toggle is tablet+ only
 * (same breakpoint as {@link useSupportsListBoardView}).
 */
export function resolveEffectiveScheduleView(
  preferred: ScheduleView,
  supportsDesktopViews: boolean,
): ScheduleView {
  return supportsDesktopViews ? preferred : SCHEDULE_MOBILE_CARD_VIEW;
}
