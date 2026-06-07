import { IsIn, IsOptional, IsString } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';

const DELIVERY_ORDERS = ['newest', 'oldest'] as const;
const DELIVERY_TIMING = ['', 'scheduled', 'immediate'] as const;
const DELIVERY_QUICK = ['', 'scheduled', 'immediate', 'sent-today'] as const;

export class AdminListDeliveriesQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  audience?: string;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @IsIn(DELIVERY_TIMING)
  timing?: (typeof DELIVERY_TIMING)[number];

  @IsOptional()
  @IsIn(DELIVERY_ORDERS)
  order?: (typeof DELIVERY_ORDERS)[number];

  @IsOptional()
  @IsIn(DELIVERY_QUICK)
  quick?: (typeof DELIVERY_QUICK)[number];
}
