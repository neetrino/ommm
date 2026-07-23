import {
  ClassSessionStatus,
  ScheduleDayOfWeek,
  SessionRecurrencePattern,
} from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  classTypeId?: string;

  @IsOptional()
  @IsString()
  coachId?: string;

  @IsOptional()
  @IsString()
  substituteCoachId?: string;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  level?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  classFormat?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  sessionRequirement?: number;

  @IsOptional()
  @IsEnum(ClassSessionStatus)
  status?: ClassSessionStatus;

  @IsOptional()
  @IsEnum(SessionRecurrencePattern)
  recurrencePattern?: SessionRecurrencePattern;

  @IsOptional()
  @IsArray()
  @IsEnum(ScheduleDayOfWeek, { each: true })
  recurrenceWeekdays?: ScheduleDayOfWeek[];

  @IsOptional()
  @IsDateString()
  recurrenceEndsAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  recurrenceCount?: number;
}
