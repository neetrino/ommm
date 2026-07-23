import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export const COACH_AVAILABILITY_MIN_SPOTS = 1;
export const COACH_AVAILABILITY_MAX_SPOTS = 200;

export class CoachScheduleSlotDto {
  @IsDateString()
  date!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  time!: string;

  @Type(() => Number)
  @IsInt()
  @Min(COACH_AVAILABILITY_MIN_SPOTS)
  @Max(COACH_AVAILABILITY_MAX_SPOTS)
  spots!: number;
}
