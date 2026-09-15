import { GiftCardStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';
import { parseCsvEnumQueryParam } from '../../common/parse-csv-query-param';

const GIFT_CARD_SORT_ORDERS = [
  'newest',
  'oldest',
  'amountHigh',
  'amountLow',
  'expirationSoon',
] as const;

export const GIFT_CARD_STATUS_FILTERS = Object.values(GiftCardStatus);

export const GIFT_CARD_EXPIRATION_FILTERS = ['valid', 'expired'] as const;

export const GIFT_CARD_QUICK_FILTERS = [
  'active',
  'expired',
  'unredeemed',
] as const;

export class ListAdminGiftCardBatchesQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, GIFT_CARD_STATUS_FILTERS),
  )
  @IsArray()
  @IsIn([...GIFT_CARD_STATUS_FILTERS], { each: true })
  status?: GiftCardStatus[];

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, GIFT_CARD_EXPIRATION_FILTERS),
  )
  @IsArray()
  @IsIn([...GIFT_CARD_EXPIRATION_FILTERS], { each: true })
  expiration?: (typeof GIFT_CARD_EXPIRATION_FILTERS)[number][];

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === '' ? undefined : Number(value),
  )
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  amountMin?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === '' ? undefined : Number(value),
  )
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  amountMax?: number;

  @IsOptional()
  @IsIn(GIFT_CARD_SORT_ORDERS)
  order?: (typeof GIFT_CARD_SORT_ORDERS)[number];

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, GIFT_CARD_QUICK_FILTERS),
  )
  @IsArray()
  @IsIn([...GIFT_CARD_QUICK_FILTERS], { each: true })
  quick?: (typeof GIFT_CARD_QUICK_FILTERS)[number][];
}
