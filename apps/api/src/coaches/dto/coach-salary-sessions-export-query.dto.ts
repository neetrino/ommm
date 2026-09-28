import { IsIn, IsOptional, Matches } from 'class-validator';

const COACH_SALARY_EXPORT_LOCALES = ['en', 'hy', 'ru'] as const;

export type CoachSalaryExportLocale =
  (typeof COACH_SALARY_EXPORT_LOCALES)[number];

/** Inclusive studio-day window for one coach's salary workbook. */
export class CoachSalarySessionsExportQueryDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to!: string;

  @IsOptional()
  @IsIn(COACH_SALARY_EXPORT_LOCALES)
  locale?: CoachSalaryExportLocale;
}
