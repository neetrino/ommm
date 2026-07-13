import { ManualPaymentMethod } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';

/** Public / user package subscribe — online Card or Cash only (not terminal). */
const PUBLIC_PACKAGE_PAYMENT_METHODS = [
  ManualPaymentMethod.CARD,
  ManualPaymentMethod.CASH,
] as const;

export type PublicPackagePaymentMethod =
  (typeof PUBLIC_PACKAGE_PAYMENT_METHODS)[number];

export class SubscribePackageDto {
  @IsString()
  @MinLength(1)
  planId!: string;

  @IsEnum(PUBLIC_PACKAGE_PAYMENT_METHODS)
  paymentMethod!: PublicPackagePaymentMethod;
}
