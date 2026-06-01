import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum AdminClientMembershipFilter {
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
  AT_RISK = 'at-risk',
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
  AT_RISK = 'at-risk',
  UNPAID = 'unpaid',
  BIRTHDAY_THIS_MONTH = 'birthday-this-month',
  INACTIVE_30_DAYS = 'inactive-30-days',
  NO_SHOW = 'no-show',
}

export class AdminListClientsQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(Object.values(AdminClientMembershipFilter))
  membership?: AdminClientMembershipFilter;

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
  @IsIn(Object.values(AdminClientQuickFilter))
  quick?: AdminClientQuickFilter;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1')
  @IsBoolean()
  meta?: boolean;

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
