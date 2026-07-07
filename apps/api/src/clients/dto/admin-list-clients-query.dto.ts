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
  VIP = 'vip',
  NEW = 'new',
  BEGINNER = 'beginner',
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
  VIP = 'vip',
  UNPAID = 'unpaid',
  BIRTHDAY_THIS_MONTH = 'birthday-this-month',
  INACTIVE_30_DAYS = 'inactive-30-days',
  NO_SHOW = 'no-show',
}

function parseAdminClientQuickFilters(
  value: unknown,
): AdminClientQuickFilter[] | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  let rawParts: string[];
  if (Array.isArray(value)) {
    rawParts = value.flatMap((entry) =>
      typeof entry === 'string' ? entry.split(',') : [],
    );
  } else if (typeof value === 'string') {
    rawParts = value.split(',');
  } else {
    return undefined;
  }

  const normalized = rawParts.map((part) => part.trim()).filter(Boolean);
  return normalized.length > 0
    ? (normalized as AdminClientQuickFilter[])
    : undefined;
}

export class AdminListClientsQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(Object.values(AdminClientPackageFilter))
  package?: AdminClientPackageFilter;

  @IsOptional()
  @IsIn(Object.values(AdminClientOrder))
  order?: AdminClientOrder;

  @IsOptional()
  @IsIn(Object.values(AdminClientTagFilter))
  tag?: AdminClientTagFilter;

  @IsOptional()
  @IsIn(Object.values(AdminClientStatusFilter))
  status?: AdminClientStatusFilter;

  @IsOptional()
  @IsIn(Object.values(AdminClientPackageTypeFilter))
  packageType?: AdminClientPackageTypeFilter;

  @IsOptional()
  @IsString()
  classLevel?: string;

  @IsOptional()
  @IsIn(Object.values(AdminClientPaymentStatusFilter))
  paymentStatus?: AdminClientPaymentStatusFilter;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  preferredCoachId?: string;

  @IsOptional()
  @IsIn(Object.values(AdminClientAttendanceFilter))
  attendance?: AdminClientAttendanceFilter;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === '' ? undefined : Number(value),
  )
  @IsInt()
  @Min(1)
  @Max(12)
  birthdayMonth?: number;

  @IsOptional()
  @Transform(({ value }) => parseAdminClientQuickFilters(value))
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
