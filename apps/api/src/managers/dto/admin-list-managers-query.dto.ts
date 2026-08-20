import { IsIn, IsOptional, IsString } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';
import {
  AdminManagerOrder,
  AdminManagerStatusFilter,
} from '../managers-list.constants';

export { AdminManagerOrder, AdminManagerStatusFilter };

export class AdminListManagersQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(Object.values(AdminManagerStatusFilter))
  status?: AdminManagerStatusFilter;

  @IsOptional()
  @IsIn(Object.values(AdminManagerOrder))
  order?: AdminManagerOrder;
}
