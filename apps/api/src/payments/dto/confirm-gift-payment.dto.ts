import { ManualPaymentMethod } from '@prisma/client';
import { IsEnum } from 'class-validator';

const GIFT_PAYMENT_METHODS = [
  ManualPaymentMethod.CARD,
  ManualPaymentMethod.CASH,
] as const;

export type GiftPaymentMethod = (typeof GIFT_PAYMENT_METHODS)[number];

export class ConfirmGiftPaymentDto {
  @IsEnum(GIFT_PAYMENT_METHODS)
  paymentMethod!: GiftPaymentMethod;
}
