import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import { DateListOrder } from '../../common/enums/list-order.enum';

/** Cash, online card, or physical terminal. */
export const ADMIN_LIST_PAYMENT_METHOD_FILTERS = [
  ManualPaymentMethod.CASH,
  ManualPaymentMethod.CARD,
  ManualPaymentMethod.CARD_TERMINAL,
] as const;

export enum PaymentSourceFilter {
  PACKAGE = 'package',
  DROPIN = 'dropin',
  GIFT = 'gift',
  OTHER = 'other',
}

export class AdminListPaymentsQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentSourceFilter)
  source?: PaymentSourceFilter;

  @IsOptional()
  @IsIn([...ADMIN_LIST_PAYMENT_METHOD_FILTERS])
  paymentMethod?: (typeof ADMIN_LIST_PAYMENT_METHOD_FILTERS)[number];

  @IsOptional()
  @IsString()
  userId?: string;

  /** Matches payment id, reference, description, or user name/email/phone. */
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;

  @IsOptional()
  @IsIn([DateListOrder.NEWEST, DateListOrder.OLDEST])
  order?: DateListOrder;
}
