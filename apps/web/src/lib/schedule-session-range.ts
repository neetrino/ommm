import { PUBLIC_SCHEDULE_RANGE_DAYS } from "@/lib/public-schedule-constants";
import {
  addDays,
  startOfLocalDay,
} from "@/components/marketing/schedule/schedule-date-utils";

function endOfLocalDay(input: Date): Date {
  const d = new Date(input);
  d.setHours(23, 59, 59, 999);
  return d;
}

export type ScheduleSessionRange = {
  from: Date;
  to: Date;
};

/** Inclusive local-day window for the public schedule (today through today + N days). */
export function resolvePublicScheduleRange(
  rangeDays: number = PUBLIC_SCHEDULE_RANGE_DAYS,
): ScheduleSessionRange {
  const from = startOfLocalDay(new Date());
  const to = endOfLocalDay(addDays(from, rangeDays));
  return { from, to };
}

/** Query string for `GET /schedule/public` with an explicit 30-day window. */
export function buildPublicScheduleRangeQuery(
  rangeDays: number = PUBLIC_SCHEDULE_RANGE_DAYS,
): string {
  const { from, to } = resolvePublicScheduleRange(rangeDays);
  return `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;
}

/** Query string for member class browsing — from start of today, no upper bound. */
export function buildMemberSessionsRangeQuery(): string {
  const from = startOfLocalDay(new Date());
  return `from=${encodeURIComponent(from.toISOString())}`;
}
