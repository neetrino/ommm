import { IsEnum, IsString, MinLength } from 'class-validator';

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
}
