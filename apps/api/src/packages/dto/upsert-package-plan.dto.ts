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
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TypeSessionAllocationDto {
  @IsString()
  @MinLength(1)
  classTypeId!: string;

  @IsInt()
  @Min(1)
  @Max(999)
  sessionCount!: number;
}

export class UpsertPackagePlanDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  categoryName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  categorySlug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  description?: string | null;

  @IsOptional()
  @IsString()
  classTypeId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  priceCents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  discountedPriceCents?: number | null;

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
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  billingPeriod?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  periodDays?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(500)
  sessionsPerMonth?: number | null;

  @IsOptional()
  @IsBoolean()
  isUnlimited?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  guestCount?: number;

  /** Remaining purchasable units; omit or null for unlimited stock. */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000)
  availableQuantity?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  buttonLabel?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  features?: string[];

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  displayOrder?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => TypeSessionAllocationDto)
  typeSessionAllocations?: TypeSessionAllocationDto[];
}
