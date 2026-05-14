import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/** Inclusive; aligns with typical employment age for coaches. */
export const COACH_MIN_AGE = 16;
/** Inclusive upper bound for a plausible coach age. */
export const COACH_MAX_AGE = 100;

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

  @Type(() => Number)
  @IsInt()
  @Min(COACH_MIN_AGE)
  @Max(COACH_MAX_AGE)
  age!: number;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  bio?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  specialization!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  experienceYears?: number;
}
