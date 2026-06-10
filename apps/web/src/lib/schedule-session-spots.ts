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

/** Forces a public schedule row to render as full (used while capacity is still loading). */
export function pinScheduleRowFull(item: MarketingScheduleItem): MarketingScheduleItem {
  return { ...item, availableSpots: 0, status: "FULL" };
}

type MemberOnWaitlistBadgeParams = {
  userBookingId?: string;
  onWaitlist: boolean;
  availableSpots: number;
  sessionStatus: string;
  capacityReady: boolean;
};

/**
 * Whether the member should see the disabled "On waitlist" action.
 * Keeps the badge during capacity hydration to avoid a brief Book flash on refresh.
 */
export function resolveMemberOnWaitlistBadge({
  userBookingId,
  onWaitlist,
  availableSpots,
  sessionStatus,
  capacityReady,
}: MemberOnWaitlistBadgeParams): boolean {
  if (userBookingId !== undefined || !onWaitlist) {
    return false;
  }
  if (!capacityReady) {
    return true;
  }
  return isScheduleSessionFull(availableSpots, sessionStatus);
}

type MemberScheduleRowDisplayParams = {
  row: MarketingScheduleItem;
  onWaitlist: boolean;
  capacityReady: boolean;
};

/** Stabilizes spot labels for waitlisted members until live capacity is ready. */
export function resolveMemberScheduleRowDisplay({
  row,
  onWaitlist,
  capacityReady,
}: MemberScheduleRowDisplayParams): MarketingScheduleItem {
  if (!capacityReady && onWaitlist) {
    return pinScheduleRowFull(row);
  }
  return row;
}
