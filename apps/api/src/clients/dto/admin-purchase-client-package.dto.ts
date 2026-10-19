import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { COUPON_CODE_MAX_LENGTH } from '../../coupons/coupon.constants';

/** Admin Client Packages purchase — Cash, physical terminal, or influencer comp. */
export const ADMIN_CLIENT_PACKAGE_PAYMENT_METHODS = [
  'CASH',
  'CARD_TERMINAL',
  'INFLUENCER',
] as const;

export type AdminClientPackagePaymentMethod =
  (typeof ADMIN_CLIENT_PACKAGE_PAYMENT_METHODS)[number];

export class AdminPurchaseClientPackageDto {
  @IsString()
  @MinLength(1)
  planId!: string;

  @IsEnum(ADMIN_CLIENT_PACKAGE_PAYMENT_METHODS)
  paymentMethod!: AdminClientPackagePaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(COUPON_CODE_MAX_LENGTH)
  couponCode?: string;
}

export class AdminPreviewClientPackageCouponDto {
  @IsString()
  @MinLength(1)
  planId!: string;

  @IsString()
  @MaxLength(COUPON_CODE_MAX_LENGTH)
  code!: string;
}
