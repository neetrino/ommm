import { BadRequestException } from '@nestjs/common';
import {
  COACH_SALARY_EXPORT_INVALID_RANGE,
  COACH_SALARY_EXPORT_RANGE_TOO_LONG,
} from './coaches-salary-export.constants';
import { assertCoachSalaryExportRange } from './coaches-salary-export-range';

describe('assertCoachSalaryExportRange', () => {
  it('accepts an inclusive range of one year or less', () => {
    expect(() =>
      assertCoachSalaryExportRange('2026-01-01', '2026-12-31'),
    ).not.toThrow();
    expect(() =>
      assertCoachSalaryExportRange('2024-01-01', '2024-12-31'),
    ).not.toThrow();
  });

  it('rejects a reversed or malformed range', () => {
    expect(() =>
      assertCoachSalaryExportRange('2026-09-26', '2026-09-01'),
    ).toThrow(BadRequestException);
    try {
      assertCoachSalaryExportRange('2026-09-26', '2026-09-01');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as BadRequestException).message).toBe(
        COACH_SALARY_EXPORT_INVALID_RANGE,
      );
    }
  });

  it('rejects a range longer than one year', () => {
    expect(() =>
      assertCoachSalaryExportRange('2024-01-01', '2025-01-01'),
    ).toThrow(COACH_SALARY_EXPORT_RANGE_TOO_LONG);
  });
});
