import { Type } from 'class-transformer';
import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';
import {
  COACH_SALARY_PER_CLASS_MAX_AMD,
  COACH_SALARY_PER_CLASS_MIN_AMD,
} from '../coaches-salary.constants';

export class CoachClassTypeRateDto {
  @IsString()
  @MinLength(1)
  classTypeId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(COACH_SALARY_PER_CLASS_MIN_AMD)
  @Max(COACH_SALARY_PER_CLASS_MAX_AMD)
  amountAmd!: number;
}
