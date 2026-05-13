import { ScheduleDayOfWeek } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const TIME_24H_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class UpdateScheduleItemDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  className?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  instructorName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  classType?: string;

  @IsOptional()
  @IsEnum(ScheduleDayOfWeek)
  dayOfWeek?: ScheduleDayOfWeek;

  @IsOptional()
  @IsString()
  @Matches(TIME_24H_REGEX)
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(TIME_24H_REGEX)
  endTime?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  availableSpots?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
