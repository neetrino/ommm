import { resolveHomeWeeklyScheduleSessionDate } from "@/components/marketing/home/resolve-home-weekly-schedule-session-date";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import {
  resolveStudioCalendarDateFromSessionDate,
  studioWallClockToUtc,
} from "@/lib/studio-timezone";

function resolveEndsAtIso(
  calendarDate: string,
  startsAtIso: string,
  item: MarketingScheduleItem,
): string | null {
  if (item.endTime !== null) {
    return studioWallClockToUtc(calendarDate, item.endTime).toISOString();
  }

  if (item.durationMinutes !== null) {
    const start = new Date(startsAtIso);
    if (Number.isNaN(start.getTime())) {
      return null;
    }
    return new Date(start.getTime() + item.durationMinutes * 60_000).toISOString();
  }

  return null;
}

/** Builds ISO start/end times for marketing schedule session date chips. */
export function buildMarketingScheduleItemDateTimeRange(
  item: MarketingScheduleItem,
): { startsAt: string; endsAt: string } | null {
  if (item.sessionDate !== null) {
    const calendarDate = resolveStudioCalendarDateFromSessionDate(item.sessionDate);
    if (calendarDate === null) {
      return null;
    }

    const startsAt = studioWallClockToUtc(calendarDate, item.startTime).toISOString();
    const endsAt = resolveEndsAtIso(calendarDate, startsAt, item);
    if (endsAt === null) {
      return null;
    }

    return { startsAt, endsAt };
  }

  const sessionDay = resolveHomeWeeklyScheduleSessionDate(item);
  const dateIso = `${sessionDay.getFullYear()}-${String(sessionDay.getMonth() + 1).padStart(2, "0")}-${String(sessionDay.getDate()).padStart(2, "0")}`;
  const startsAt = studioWallClockToUtc(dateIso, item.startTime).toISOString();
  const endsAt = resolveEndsAtIso(dateIso, startsAt, item);
  if (endsAt === null) {
    return null;
  }

  return { startsAt, endsAt };
}
