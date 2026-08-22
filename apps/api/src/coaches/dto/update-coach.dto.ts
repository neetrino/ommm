import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEmail,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { COACH_MAX_AGE, COACH_MIN_AGE } from './create-coach.dto';
import {
  COACH_SALARY_PER_CLASS_MAX_AMD,
  COACH_SALARY_PER_CLASS_MIN_AMD,
} from '../coaches-salary.constants';
import { CoachScheduleSlotDto } from './coach-schedule-slot.dto';

export class UpdateCoachDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @ValidateIf(
    (_object, value: string | null | undefined) =>
      value !== null && value !== '',
  )
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string | null;

  @IsOptional()
  @ValidateIf(
    (_object, value: string | null | undefined) =>
      value !== null && value !== '',
  )
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  lastName?: string | null;

  @IsOptional()
  @ValidateIf((_object, value: string | null | undefined) => value !== null)
  @IsString()
  @MaxLength(32)
  phone?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(COACH_MIN_AGE)
  @Max(COACH_MAX_AGE)
  age?: number;

  @IsOptional()
  @ValidateIf((_object, value: string | null | undefined) => value !== null)
  @IsDateString()
  birthday?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  photoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  bio?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  specialization?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  classType?: string | null;

  @IsOptional()
  @IsInt()
  experienceYears?: number | null;

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

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
