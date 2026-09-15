import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';
import { parseCsvEnumQueryParam } from '../../common/parse-csv-query-param';
import { BroadcastAudience } from './broadcast.dto';

const SCHEDULED_ORDERS = ['newest', 'oldest', 'schedule'] as const;

export const SCHEDULED_STATUS_FILTERS = [
  'PENDING',
  'FAILED',
  'SENT',
  'CANCELLED',
] as const;
export type ScheduledStatusFilter = (typeof SCHEDULED_STATUS_FILTERS)[number];

export const SCHEDULED_AUDIENCE_FILTERS = Object.values(BroadcastAudience);

export const SCHEDULED_QUICK_FILTERS = ['pending', 'failed', 'sent'] as const;
export type ScheduledQuickFilter = (typeof SCHEDULED_QUICK_FILTERS)[number];

export class AdminListScheduledQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, SCHEDULED_STATUS_FILTERS),
  )
  @IsArray()
  @IsIn([...SCHEDULED_STATUS_FILTERS], { each: true })
  status?: ScheduledStatusFilter[];

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, SCHEDULED_AUDIENCE_FILTERS),
  )
  @IsArray()
  @IsIn([...SCHEDULED_AUDIENCE_FILTERS], { each: true })
  audience?: BroadcastAudience[];

  @IsOptional()
  @IsIn(SCHEDULED_ORDERS)
  order?: (typeof SCHEDULED_ORDERS)[number];

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, SCHEDULED_QUICK_FILTERS),
  )
  @IsArray()
  @IsIn([...SCHEDULED_QUICK_FILTERS], { each: true })
  quick?: ScheduledQuickFilter[];
}
