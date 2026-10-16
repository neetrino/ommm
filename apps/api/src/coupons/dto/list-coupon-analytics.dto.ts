import { CouponDiscountType } from '@prisma/client';
import {
  IsEnum,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const DISPLAY_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'EXPIRED',
  'DISABLED',
  'USAGE_LIMIT_REACHED',
] as const;

export class ListCouponAnalyticsQueryDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  couponId?: string;

  @IsOptional()
  @IsEnum(CouponDiscountType)
  discountType?: CouponDiscountType;

  @IsOptional()
  @IsIn(DISPLAY_STATUSES)
  status?: (typeof DISPLAY_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(191)
  creatorId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  userEmail?: string;
}
