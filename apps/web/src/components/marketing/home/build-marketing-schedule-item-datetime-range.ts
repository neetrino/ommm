import { resolveHomeWeeklyScheduleSessionDate } from "@/components/marketing/home/resolve-home-weekly-schedule-session-date";
import { startOfLocalDay } from "@/components/marketing/schedule/schedule-date-utils";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { combineIsoDateAndTime } from "@/lib/date-display";

function toLocalDateIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function resolveEndsAtIso(
  startsAtIso: string,
  dateIso: string,
  item: MarketingScheduleItem,
): string | null {
  if (item.endTime !== null) {
    return combineIsoDateAndTime(dateIso, item.endTime);
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
    const sessionDay = startOfLocalDay(new Date(item.sessionDate));
    if (Number.isNaN(sessionDay.getTime())) {
      return null;
    }

    const dateIso = toLocalDateIso(sessionDay);
    const startsAt =
      combineIsoDateAndTime(dateIso, item.startTime) ?? item.sessionDate;
    const endsAt = resolveEndsAtIso(startsAt, dateIso, item);
    if (endsAt === null) {
      return null;
    }

    return { startsAt, endsAt };
  }

  const sessionDay = resolveHomeWeeklyScheduleSessionDate(item);
  const dateIso = toLocalDateIso(sessionDay);
  const startsAt = combineIsoDateAndTime(dateIso, item.startTime);
  if (startsAt === null) {
    return null;
  }

  const endsAt = resolveEndsAtIso(startsAt, dateIso, item);
  if (endsAt === null) {
    return null;
  }

  return { startsAt, endsAt };
}
