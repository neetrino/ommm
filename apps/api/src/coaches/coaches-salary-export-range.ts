import { BadRequestException } from '@nestjs/common';
import {
  COACH_SALARY_EXPORT_INVALID_RANGE,
  COACH_SALARY_EXPORT_MAX_INCLUSIVE_DAYS,
  COACH_SALARY_EXPORT_RANGE_TOO_LONG,
  coachSalaryExportInclusiveDaySpan,
} from './coaches-salary-export.constants';

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Rejects an export unless both bounds are calendar days, ordered, and within one year. */
export function assertCoachSalaryExportRange(from: string, to: string): void {
  if (!ISO_DAY.test(from) || !ISO_DAY.test(to) || from > to) {
    throw new BadRequestException(COACH_SALARY_EXPORT_INVALID_RANGE);
  }
  const span = coachSalaryExportInclusiveDaySpan(from, to);
  if (span > COACH_SALARY_EXPORT_MAX_INCLUSIVE_DAYS) {
    throw new BadRequestException(COACH_SALARY_EXPORT_RANGE_TOO_LONG);
  }
}
