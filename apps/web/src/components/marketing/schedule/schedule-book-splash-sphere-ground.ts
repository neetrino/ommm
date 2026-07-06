import type { MeasureSphereGroundY } from "@/components/marketing/home/sphere-bounce-types";
import { SCHEDULE_BOOK_SPLASH_SPHERE_BOUNCE } from "@/components/marketing/schedule/schedule-book-splash-sphere-tokens";

const SCHEDULE_BOOK_SPLASH_SPHERE_STAGE_SELECTOR = "[data-schedule-book-splash-sphere-stage]";

/** Keeps the bounce inside the schedule booking splash logo stage. */
export const measureScheduleBookSplashSphereGroundY: MeasureSphereGroundY = (
  el,
  logicalY,
  reachPx,
) => {
  const stage = el.closest(SCHEDULE_BOOK_SPLASH_SPHERE_STAGE_SELECTOR);
  const rect = el.getBoundingClientRect();
  const restBottom = rect.bottom - logicalY;
  const maxDropPx = SCHEDULE_BOOK_SPLASH_SPHERE_BOUNCE.maxDropPx;

  if (stage instanceof HTMLElement) {
    const stageRect = stage.getBoundingClientRect();
    const drop = Math.max(0, stageRect.bottom - restBottom + reachPx);
    return Math.min(maxDropPx, drop);
  }

  return maxDropPx;
};
