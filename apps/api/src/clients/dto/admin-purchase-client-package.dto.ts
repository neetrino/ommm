import { ManualPaymentMethod } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';

/** Admin Client Packages purchase — Cash or physical card terminal only. */
export const ADMIN_CLIENT_PACKAGE_PAYMENT_METHODS = [
  ManualPaymentMethod.CASH,
  ManualPaymentMethod.CARD_TERMINAL,
] as const;

export type AdminClientPackagePaymentMethod =
  (typeof ADMIN_CLIENT_PACKAGE_PAYMENT_METHODS)[number];

export class AdminPurchaseClientPackageDto {
  @IsString()
  @MinLength(1)
  planId!: string;

  @IsEnum(ADMIN_CLIENT_PACKAGE_PAYMENT_METHODS)
  paymentMethod!: AdminClientPackagePaymentMethod;
}
