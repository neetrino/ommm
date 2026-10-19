import { IsISO8601 } from 'class-validator';

/** Admin-chosen cash or terminal paid instant. Stored on `Payment.confirmedAt`. */
export class AdminUpdatePaymentPaidAtDto {
  @IsISO8601()
  paidAt!: string;
}
