import { IsIn, IsOptional, IsString } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';

const SCHEDULED_ORDERS = ['newest', 'oldest', 'schedule'] as const;
const SCHEDULED_QUICK = ['', 'pending', 'failed', 'sent'] as const;

export class AdminListScheduledQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  audience?: string;

  @IsOptional()
  @IsIn(SCHEDULED_ORDERS)
  order?: (typeof SCHEDULED_ORDERS)[number];

  @IsOptional()
  @IsIn(SCHEDULED_QUICK)
  quick?: (typeof SCHEDULED_QUICK)[number];
}
