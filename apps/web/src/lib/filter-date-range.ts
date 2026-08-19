import { endOfStudioDayInclusive, studioWallClockToUtc } from "@/lib/studio-timezone";

/** Inclusive studio-day match. A lone `from` is that single calendar day. */
export function matchesStudioDateFilter(
  startsAtIso: string,
  from: string,
  to: string,
): boolean {
  const startsAt = new Date(startsAtIso);
  const toDay = to.length > 0 ? to : from;
  if (from.length > 0 && startsAt < studioWallClockToUtc(from, "00:00")) {
    return false;
  }
  if (toDay.length > 0 && startsAt > endOfStudioDayInclusive(studioWallClockToUtc(toDay, "12:00"))) {
    return false;
  }
  return true;
}
