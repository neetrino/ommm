export type ScheduleView = "list" | "weekly";

export const SCHEDULE_VIEW_MODES: readonly ScheduleView[] = ["list", "weekly"];

/** Normalizes legacy URL view params (monthly/daily) to supported schedule views. */
export function resolveScheduleView(value: string | undefined): ScheduleView {
  return value === "weekly" ? "weekly" : "list";
}
