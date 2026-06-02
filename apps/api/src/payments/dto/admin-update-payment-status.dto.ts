import { PaymentStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

const ADMIN_PAYMENT_STATUSES = [
  PaymentStatus.SUCCEEDED,
  PaymentStatus.FAILED,
] as const;

export type AdminUpdatablePaymentStatus =
  (typeof ADMIN_PAYMENT_STATUSES)[number];

export class AdminUpdatePaymentStatusDto {
  @IsEnum(ADMIN_PAYMENT_STATUSES)
  status!: AdminUpdatablePaymentStatus;
}
