import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import { DateListOrder } from '../../common/enums/list-order.enum';
import { parseCsvEnumQueryParam } from '../../common/parse-csv-query-param';

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
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, Object.values(PaymentStatus)),
  )
  @IsArray()
  @IsIn(Object.values(PaymentStatus), { each: true })
  status?: PaymentStatus[];

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, Object.values(PaymentSourceFilter)),
  )
  @IsArray()
  @IsIn(Object.values(PaymentSourceFilter), { each: true })
  source?: PaymentSourceFilter[];

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, ADMIN_LIST_PAYMENT_METHOD_FILTERS),
  )
  @IsArray()
  @IsIn([...ADMIN_LIST_PAYMENT_METHOD_FILTERS], { each: true })
  paymentMethod?: (typeof ADMIN_LIST_PAYMENT_METHOD_FILTERS)[number][];

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
