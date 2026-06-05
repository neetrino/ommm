import { ClassSessionStatus, ScheduleDayOfWeek } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateSessionBatchSlotDto {
  @IsEnum(ScheduleDayOfWeek)
  weekday!: ScheduleDayOfWeek;

  @IsString()
  @MinLength(5)
  @MaxLength(5)
  @Matches(/^\d{2}:\d{2}$/)
  startTime!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(5)
  @Matches(/^\d{2}:\d{2}$/)
  endTime!: string;
}

export class CreateSessionBatchDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsString()
  classTypeId!: string;

  @IsString()
  coachId!: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  level?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(ClassSessionStatus)
  status?: ClassSessionStatus;

  @IsInt()
  timezoneOffsetMinutes!: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(21)
  @ValidateNested({ each: true })
  @Type(() => CreateSessionBatchSlotDto)
  slots!: CreateSessionBatchSlotDto[];
}
