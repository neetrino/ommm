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
  ValidateIf,
} from 'class-validator';

const TIME_24H_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateScheduleItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  className!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  instructorName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  classType!: string;

  @IsEnum(ScheduleDayOfWeek)
  dayOfWeek!: ScheduleDayOfWeek;

  @IsString()
  @Matches(TIME_24H_REGEX)
  startTime!: string;

  @IsOptional()
  @IsString()
  @Matches(TIME_24H_REGEX)
  endTime?: string;

  @ValidateIf((dto: CreateScheduleItemDto) => dto.endTime === undefined)
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsInt()
  @Min(1)
  availableSpots!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
