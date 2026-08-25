import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { StaffActivityType } from '@prisma/client';
import { MAX_LIST_PAGE_SIZE } from '../../common/dto/list-pagination-query.dto';
import { STAFF_ACTIVITY_PAGE_TAKE } from '../staff-activity.constants';

export const STAFF_ACTIVITY_TYPE_FILTERS = [
  StaffActivityType.BOOKING_CREATED,
  StaffActivityType.BOOKING_CANCELLED,
] as const;

export type StaffActivityTypeFilter =
  (typeof STAFF_ACTIVITY_TYPE_FILTERS)[number];

export class ListStaffActivityQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIST_PAGE_SIZE)
  take?: number = STAFF_ACTIVITY_PAGE_TAKE;

  @IsOptional()
  @IsIn(STAFF_ACTIVITY_TYPE_FILTERS)
  type?: StaffActivityTypeFilter;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}
