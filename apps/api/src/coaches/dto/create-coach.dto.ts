import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CoachScheduleSlotDto } from './coach-schedule-slot.dto';
import {
  COACH_SALARY_PER_CLASS_MAX_AMD,
  COACH_SALARY_PER_CLASS_MIN_AMD,
} from '../coaches-salary.constants';

/** Inclusive; aligns with typical employment age for coaches. */
export const COACH_MIN_AGE = 16;
/** Inclusive upper bound for a plausible coach age. */
export const COACH_MAX_AGE = 100;
/** Inclusive upper bound for coach experience years. */
export const COACH_MAX_EXPERIENCE_YEARS = 80;

export class CreateCoachDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  lastName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  phone!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(COACH_MIN_AGE)
  @Max(COACH_MAX_AGE)
  age?: number;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  photoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  bio?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  specialization!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  classType!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(COACH_MAX_EXPERIENCE_YEARS)
  experienceYears?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(COACH_SALARY_PER_CLASS_MIN_AMD)
  @Max(COACH_SALARY_PER_CLASS_MAX_AMD)
  salaryPerClassAmd?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  assignedClassTypeIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoachScheduleSlotDto)
  schedule?: CoachScheduleSlotDto[];
}
