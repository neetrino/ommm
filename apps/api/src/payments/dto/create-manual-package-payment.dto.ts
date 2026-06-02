import { ManualPaymentMethod } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateManualPackagePaymentDto {
  @IsString()
  planId!: string;

  @IsEnum(ManualPaymentMethod)
  paymentMethod!: ManualPaymentMethod;
}
