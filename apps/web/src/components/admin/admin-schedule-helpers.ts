import type { ScheduleDayOfWeek } from "@/components/admin/admin-schedule-types";

export const SCHEDULE_DAY_OPTIONS: readonly ScheduleDayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const TIME_24H_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTime24h(value: string): boolean {
  return TIME_24H_REGEX.test(value);
}

export function minutesFromTime(value: string): number {
  const [hour, minute] = value.split(":").map((part) => Number(part));
  return hour * 60 + minute;
}
