import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  parseCsvEnumQueryParam,
  parseCsvQueryParam,
} from '../../common/parse-csv-query-param';

export enum AdminClientPackageFilter {
  ALL = 'all',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum AdminClientOrder {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  MOST_ACTIVE = 'most-active',
  HIGHEST_LIFETIME_VALUE = 'highest-lifetime-value',
  LAST_VISIT_NEWEST = 'last-visit-newest',
  LAST_VISIT_OLDEST = 'last-visit-oldest',
  MOST_BOOKINGS = 'most-bookings',
  MOST_CANCELLATIONS = 'most-cancellations',
}

export enum AdminClientTagFilter {
  NEW = 'new',
  BEGINNER = 'beginner',
  INFLUENCER = 'influencer',
}

export enum AdminClientStatusFilter {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FROZEN = 'frozen',
  BLOCKED = 'blocked',
}

export enum AdminClientPackageTypeFilter {
  SINGLE_CLASS = 'single-class',
  MONTHLY_PACKAGE = 'monthly-package',
  VIP_PACKAGE = 'vip-package',
}

export enum AdminClientPaymentStatusFilter {
  PAID = 'paid',
  UNPAID = 'unpaid',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
}

export enum AdminClientAttendanceFilter {
  REGULAR = 'regular',
  NO_SHOW = 'no-show',
  OFTEN_CANCELS = 'often-cancels',
  LOW_ATTENDANCE = 'low-attendance',
}

export enum AdminClientQuickFilter {
  NEW = 'new',
  UNPAID = 'unpaid',
  BIRTHDAY_THIS_MONTH = 'birthday-this-month',
  INACTIVE_30_DAYS = 'inactive-30-days',
  NO_SHOW = 'no-show',
}

function parseBirthdayMonths(value: unknown): number[] | undefined {
  const months = parseCsvQueryParam(value)
    .map((part) => Number(part))
    .filter((month) => Number.isInteger(month) && month >= 1 && month <= 12);
  return months.length > 0 ? months : undefined;
}

export class AdminListClientsQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(
      value,
      Object.values(AdminClientPackageFilter).filter(
        (entry) => entry !== AdminClientPackageFilter.ALL,
      ),
    ),
  )
  @IsArray()
  @IsIn(
    Object.values(AdminClientPackageFilter).filter(
      (entry) => entry !== AdminClientPackageFilter.ALL,
    ),
    { each: true },
  )
  package?: AdminClientPackageFilter[];

  @IsOptional()
  @IsIn(Object.values(AdminClientOrder))
  order?: AdminClientOrder;

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, Object.values(AdminClientTagFilter)),
  )
  @IsArray()
  @IsIn(Object.values(AdminClientTagFilter), { each: true })
  tag?: AdminClientTagFilter[];

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, Object.values(AdminClientStatusFilter)),
  )
  @IsArray()
  @IsIn(Object.values(AdminClientStatusFilter), { each: true })
  status?: AdminClientStatusFilter[];

  @IsOptional()
  @IsIn(Object.values(AdminClientPackageTypeFilter))
  packageType?: AdminClientPackageTypeFilter;

  @IsOptional()
  @Transform(({ value }) => {
    const parts = parseCsvQueryParam(value);
    return parts.length > 0 ? parts : undefined;
  })
  @IsArray()
  @IsString({ each: true })
  classLevel?: string[];

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, Object.values(AdminClientPaymentStatusFilter)),
  )
  @IsArray()
  @IsIn(Object.values(AdminClientPaymentStatusFilter), { each: true })
  paymentStatus?: AdminClientPaymentStatusFilter[];

  @IsOptional()
  @Transform(({ value }) => {
    const parts = parseCsvQueryParam(value);
    return parts.length > 0 ? parts : undefined;
  })
  @IsArray()
  @IsString({ each: true })
  source?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    const parts = parseCsvQueryParam(value);
    return parts.length > 0 ? parts : undefined;
  })
  @IsArray()
  @IsString({ each: true })
  preferredCoachId?: string[];

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, Object.values(AdminClientAttendanceFilter)),
  )
  @IsArray()
  @IsIn(Object.values(AdminClientAttendanceFilter), { each: true })
  attendance?: AdminClientAttendanceFilter[];

  @IsOptional()
  @Transform(({ value }) => parseBirthdayMonths(value))
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(12, { each: true })
  birthdayMonth?: number[];

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, Object.values(AdminClientQuickFilter)),
  )
  @IsArray()
  @IsIn(Object.values(AdminClientQuickFilter), { each: true })
  quick?: AdminClientQuickFilter[];

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1')
  @IsBoolean()
  meta?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1')
  @IsBoolean()
  giftCardOnly?: boolean;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(500)
  take?: number;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  offset?: number;
}
