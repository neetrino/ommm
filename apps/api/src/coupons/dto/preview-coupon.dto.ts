import { CouponProductKind } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  Max,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { COUPON_CODE_MAX_LENGTH, COUPON_FIXED_MAX_AMD } from '../coupon.constants';

export class PreviewCouponLineDto {
  @IsEnum(CouponProductKind)
  kind!: CouponProductKind;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  packagePlanId?: string;
}

export class PreviewCouponDto {
  @IsString()
  @MaxLength(COUPON_CODE_MAX_LENGTH)
  code!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(COUPON_FIXED_MAX_AMD)
  subtotalCents!: number;

  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => PreviewCouponLineDto)
  lines!: PreviewCouponLineDto[];

  @IsOptional()
  @IsBoolean()
  useGiftCredits?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  giftCardIds?: string[];
}
