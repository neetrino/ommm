import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdatePlanDto {
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
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sessionsPerMonth?: number;

  @IsOptional()
  @IsBoolean()
  isUnlimited?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  periodDays?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  billingPeriod?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(140, { each: true })
  features?: string[];

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  buttonLabel?: string;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  stripePriceId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
