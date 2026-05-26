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
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { COACH_MAX_AGE, COACH_MIN_AGE } from './create-coach.dto';
import { CoachScheduleSlotDto } from './coach-schedule-slot.dto';

export class UpdateCoachDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  phone?: string;

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

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  specialization?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  classType?: string;

  @IsOptional()
  @IsInt()
  experienceYears?: number;

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
