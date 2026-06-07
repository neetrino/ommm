import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PaymentStatus } from '@prisma/client';

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
  @IsString()
  userId?: string;

  /** Matches payment id, reference, description, or user name/email/phone. */
  @IsOptional()
  @IsString()
  q?: string;

  /** Filters package payments by purchased plan id. */
  @IsOptional()
  @IsString()
  planId?: string;

  /** Filters package payments by plan category name (case-insensitive). */
  @IsOptional()
  @IsString()
  packageClass?: string;

  /** Filters package payments by session count (`unlimited` or positive integer string). */
  @IsOptional()
  @IsString()
  sessions?: string;

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
}
