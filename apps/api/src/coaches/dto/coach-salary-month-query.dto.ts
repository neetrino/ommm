import { IsOptional, Matches } from 'class-validator';

/** Calendar month for a coach's own salary summary (`YYYY-MM`). */
export class CoachSalaryMonthQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/)
  month?: string;
}
