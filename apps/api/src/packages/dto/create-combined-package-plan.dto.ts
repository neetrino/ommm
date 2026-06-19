import {
  ArrayMinSize,
  ArrayUnique,
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

export class CreateCombinedPackagePlanDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  priceCents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  pricePerSessionCents?: number;

  @IsOptional()
  @IsBoolean()
  showPricePerSession?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(16)
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isUnlimited?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(500)
  sessionsPerMonth?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  periodDays?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  billingPeriod?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  guestCount?: number;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  @ArrayUnique()
  @ArrayMinSize(2)
  @IsString({ each: true })
  sourcePlanIds!: string[];
}
