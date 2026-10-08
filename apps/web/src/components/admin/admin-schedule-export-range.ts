/** Inclusive studio days allowed in one schedule workbook. */
export const SCHEDULE_EXPORT_MAX_INCLUSIVE_DAYS = 366;

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;

export type ScheduleExportRangeIssue = "invalid" | "tooLong";

/** Why the marked range cannot be exported. Null when the workbook can be built. */
export function scheduleExportRangeIssue(
  from: string,
  to: string,
): ScheduleExportRangeIssue | null {
  if (!ISO_DAY.test(from) || !ISO_DAY.test(to) || from > to) {
    return "invalid";
  }
  const start = Date.parse(`${from}T00:00:00.000Z`);
  const end = Date.parse(`${to}T00:00:00.000Z`);
  const span = Math.floor((end - start) / MS_PER_DAY) + 1;
  if (span > SCHEDULE_EXPORT_MAX_INCLUSIVE_DAYS) {
    return "tooLong";
  }
  return null;
}
