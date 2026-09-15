import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';
import { parseCsvEnumQueryParam } from '../../common/parse-csv-query-param';
import { BroadcastAudience } from './broadcast.dto';

const DELIVERY_ORDERS = ['newest', 'oldest'] as const;

export const DELIVERY_AUDIENCE_FILTERS = Object.values(BroadcastAudience);

export const DELIVERY_CHANNEL_FILTERS = ['email'] as const;
export type DeliveryChannelFilter = (typeof DELIVERY_CHANNEL_FILTERS)[number];

export const DELIVERY_TIMING_FILTERS = ['scheduled', 'immediate'] as const;
export type DeliveryTimingFilter = (typeof DELIVERY_TIMING_FILTERS)[number];

export const DELIVERY_QUICK_FILTERS = [
  'scheduled',
  'immediate',
  'sent-today',
] as const;
export type DeliveryQuickFilter = (typeof DELIVERY_QUICK_FILTERS)[number];

export class AdminListDeliveriesQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, DELIVERY_AUDIENCE_FILTERS),
  )
  @IsArray()
  @IsIn([...DELIVERY_AUDIENCE_FILTERS], { each: true })
  audience?: BroadcastAudience[];

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, DELIVERY_CHANNEL_FILTERS),
  )
  @IsArray()
  @IsIn([...DELIVERY_CHANNEL_FILTERS], { each: true })
  channel?: DeliveryChannelFilter[];

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, DELIVERY_TIMING_FILTERS),
  )
  @IsArray()
  @IsIn([...DELIVERY_TIMING_FILTERS], { each: true })
  timing?: DeliveryTimingFilter[];

  @IsOptional()
  @IsIn(DELIVERY_ORDERS)
  order?: (typeof DELIVERY_ORDERS)[number];

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, DELIVERY_QUICK_FILTERS),
  )
  @IsArray()
  @IsIn([...DELIVERY_QUICK_FILTERS], { each: true })
  quick?: DeliveryQuickFilter[];
}
