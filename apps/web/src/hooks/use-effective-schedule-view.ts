import { type ScheduleView } from "@/components/admin/admin-schedule-view";

/**
 * Staff schedule view — list / week / month on phones and desktop.
 * Week board scrolls horizontally on narrow viewports.
 */
export function useEffectiveScheduleView(preferred: ScheduleView): ScheduleView {
  return preferred;
}
