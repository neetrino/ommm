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
import {
  parseCsvEnumQueryParam,
  parseCsvQueryParam,
} from '../../common/parse-csv-query-param';

/** Cash, online card, physical terminal, or influencer comp. */
export const ADMIN_LIST_PAYMENT_METHOD_FILTERS = [
  ManualPaymentMethod.CASH,
  ManualPaymentMethod.CARD,
  ManualPaymentMethod.CARD_TERMINAL,
  ManualPaymentMethod.INFLUENCER,
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

  /** Comma-separated package plan ids. */
  @IsOptional()
  @Transform(({ value }) => {
    const parts = parseCsvQueryParam(value);
    return parts.length > 0 ? parts : undefined;
  })
  @IsArray()
  @IsString({ each: true })
  planId?: string[];

  /** Comma-separated package category names. */
  @IsOptional()
  @Transform(({ value }) => {
    const parts = parseCsvQueryParam(value);
    return parts.length > 0 ? parts : undefined;
  })
  @IsArray()
  @IsString({ each: true })
  packageClass?: string[];

  /** Comma-separated session counts (`8`) and/or `unlimited`. */
  @IsOptional()
  @Transform(({ value }) => {
    const parts = parseCsvQueryParam(value);
    return parts.length > 0 ? parts : undefined;
  })
  @IsArray()
  @IsString({ each: true })
  sessions?: string[];

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
