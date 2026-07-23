import { ManualPaymentMethod } from '@prisma/client';
import { IsEnum } from 'class-validator';

const DROPIN_PAYMENT_METHODS = [
  ManualPaymentMethod.CARD,
  ManualPaymentMethod.CASH,
] as const;

export type DropInPaymentMethod = (typeof DROPIN_PAYMENT_METHODS)[number];

export class ConfirmDropInPaymentDto {
  @IsEnum(DROPIN_PAYMENT_METHODS)
  paymentMethod!: DropInPaymentMethod;
}
