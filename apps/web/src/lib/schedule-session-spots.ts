import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";

/** Whether a public schedule session has no remaining bookable spots. */
export function isScheduleSessionFull(availableSpots: number, status: string): boolean {
  return status === "FULL" || availableSpots <= 0;
}

/** Applies a booking/cancellation delta to a public schedule row. */
export function applyScheduleSpotDelta(
  item: MarketingScheduleItem,
  delta: number,
): MarketingScheduleItem {
  const nextSpots = Math.max(0, item.availableSpots + delta);
  const wasFull = isScheduleSessionFull(item.availableSpots, item.status);
  const nowFull = nextSpots <= 0;

  let nextStatus = item.status;
  if (nowFull) {
    nextStatus = "FULL";
  } else if (wasFull && nextSpots > 0) {
    nextStatus = "ACTIVE";
  }

  return { ...item, availableSpots: nextSpots, status: nextStatus };
}
