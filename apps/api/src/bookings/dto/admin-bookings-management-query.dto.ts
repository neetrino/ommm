import { Transform } from 'class-transformer';
import { BookingChannel, BookingStatus } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { BookingManagementOrder } from '../../common/enums/list-order.enum';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';
import {
  parseCsvEnumQueryParam,
  parseCsvQueryParam,
} from '../../common/parse-csv-query-param';

/** Derived booking payment labels returned by admin management rows. */
export enum AdminBookingPaymentStatusFilter {
  PAID = 'PAID',
  CASH = 'CASH',
  UNPAID = 'UNPAID',
  CANCELLED = 'CANCELLED',
}

export class AdminBookingsManagementQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Transform(({ value }) => {
    const parts = parseCsvQueryParam(value);
    return parts.length > 0 ? parts : undefined;
  })
  @IsArray()
  @IsString({ each: true })
  classTypeId?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    const parts = parseCsvQueryParam(value);
    return parts.length > 0 ? parts : undefined;
  })
  @IsArray()
  @IsString({ each: true })
  coachId?: string[];

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, Object.values(BookingStatus)),
  )
  @IsArray()
  @IsIn(Object.values(BookingStatus), { each: true })
  status?: BookingStatus[];

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, Object.values(BookingChannel)),
  )
  @IsArray()
  @IsIn(Object.values(BookingChannel), { each: true })
  channel?: BookingChannel[];

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(
      value,
      Object.values(AdminBookingPaymentStatusFilter),
    ),
  )
  @IsArray()
  @IsIn(Object.values(AdminBookingPaymentStatusFilter), { each: true })
  paymentStatus?: AdminBookingPaymentStatusFilter[];

  @IsOptional()
  @Transform(({ value }) => {
    const parts = parseCsvQueryParam(value);
    return parts.length > 0 ? parts : undefined;
  })
  @IsArray()
  @IsString({ each: true })
  attendanceStatus?: string[];

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1')
  @IsBoolean()
  countOnly?: boolean;

  @IsOptional()
  @IsIn(Object.values(BookingManagementOrder))
  order?: BookingManagementOrder;
}
