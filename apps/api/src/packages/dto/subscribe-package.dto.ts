import { ManualPaymentMethod } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class SubscribePackageDto {
  @IsString()
  @MinLength(1)
  planId!: string;

  @IsEnum(ManualPaymentMethod)
  paymentMethod!: ManualPaymentMethod;
}
