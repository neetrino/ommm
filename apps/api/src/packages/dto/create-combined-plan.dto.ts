import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const MAX_PACKAGE_GUEST_COUNT = 99;
const MIN_COMBINED_SOURCE_PLAN_COUNT = 2;
const MAX_COMBINED_SOURCE_PLAN_COUNT = 20;

export class CreateCombinedPlanDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsInt()
  @Min(0)
  priceCents!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  pricePerSessionCents?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sessionsPerMonth?: number;

  @IsBoolean()
  isUnlimited!: boolean;

  @IsInt()
  @Min(1)
  periodDays!: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  billingPeriod?: string;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_PACKAGE_GUEST_COUNT)
  guestCount?: number;

  @IsArray()
  @ArrayMinSize(MIN_COMBINED_SOURCE_PLAN_COUNT)
  @ArrayMaxSize(MAX_COMBINED_SOURCE_PLAN_COUNT)
  @IsString({ each: true })
  sourcePlanIds!: string[];
}
