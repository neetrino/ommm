import { CouponDiscountType, CouponProductKind } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  COUPON_CODE_MAX_LENGTH,
  COUPON_ELIGIBLE_PRODUCT_MAX,
  COUPON_ELIGIBLE_USER_MAX,
  COUPON_FIXED_MAX_AMD,
  COUPON_USAGE_LIMIT_MAX,
} from '../coupon.constants';

export class CouponProductInputDto {
  @IsEnum(CouponProductKind)
  kind!: CouponProductKind;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  packagePlanId?: string;
}

export class UpsertCouponDto {
  @IsString()
  @MaxLength(COUPON_CODE_MAX_LENGTH)
  code!: string;

  @IsEnum(CouponDiscountType)
  discountType!: CouponDiscountType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(COUPON_FIXED_MAX_AMD)
  discountValue!: number;

  @IsOptional()
  @IsISO8601()
  validFrom?: string;

  @IsOptional()
  @IsISO8601()
  validUntil?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(COUPON_USAGE_LIMIT_MAX)
  totalUsageLimit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(COUPON_USAGE_LIMIT_MAX)
  usageLimitPerUser?: number;

  @IsBoolean()
  eligibleAllUsers!: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(COUPON_ELIGIBLE_USER_MAX)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  eligibleEmails?: string[];

  @IsBoolean()
  eligibleAllProducts!: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(COUPON_ELIGIBLE_PRODUCT_MAX)
  @ValidateNested({ each: true })
  @Type(() => CouponProductInputDto)
  eligibleProducts?: CouponProductInputDto[];
}
