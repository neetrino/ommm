/** Inclusive studio days allowed in one coach salary workbook. Matches the API cap. */
export const COACH_SALARY_EXPORT_MAX_INCLUSIVE_DAYS = 366;

export const COACH_SALARY_EXPORT_RANGE_DEBOUNCE_MS = 300;

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;

export type SalaryExportRangeIssue = "invalid" | "tooLong";

/** Why the marked range cannot be exported. Null when the workbook can be built. */
export function salaryExportRangeIssue(
  from: string,
  to: string,
): SalaryExportRangeIssue | null {
  if (!ISO_DAY.test(from) || !ISO_DAY.test(to) || from > to) {
    return "invalid";
  }
  const start = Date.parse(`${from}T00:00:00.000Z`);
  const end = Date.parse(`${to}T00:00:00.000Z`);
  const span = Math.floor((end - start) / MS_PER_DAY) + 1;
  if (span > COACH_SALARY_EXPORT_MAX_INCLUSIVE_DAYS) {
    return "tooLong";
  }
  return null;
}
