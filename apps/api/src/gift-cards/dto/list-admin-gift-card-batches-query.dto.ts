import { GiftCardStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';

const GIFT_CARD_SORT_ORDERS = [
  'newest',
  'oldest',
  'amountHigh',
  'amountLow',
  'expirationSoon',
] as const;

const GIFT_CARD_QUICK_FILTERS = [
  '',
  'active',
  'expired',
  'unredeemed',
] as const;

export class ListAdminGiftCardBatchesQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn([...Object.values(GiftCardStatus), 'all'])
  status?: string;

  @IsOptional()
  @IsIn(['all', 'valid', 'expired'])
  expiration?: string;

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
  @IsIn(GIFT_CARD_QUICK_FILTERS)
  quick?: (typeof GIFT_CARD_QUICK_FILTERS)[number];
}
