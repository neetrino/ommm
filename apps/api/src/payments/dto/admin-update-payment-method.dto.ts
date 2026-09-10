import { ManualPaymentMethod } from '@prisma/client';
import { IsEnum } from 'class-validator';

const STUDIO_PAYMENT_METHODS = [
  ManualPaymentMethod.CASH,
  ManualPaymentMethod.CARD_TERMINAL,
] as const;

export type AdminUpdatablePaymentMethod =
  (typeof STUDIO_PAYMENT_METHODS)[number];

export class AdminUpdatePaymentMethodDto {
  @IsEnum(STUDIO_PAYMENT_METHODS)
  paymentMethod!: AdminUpdatablePaymentMethod;
}
