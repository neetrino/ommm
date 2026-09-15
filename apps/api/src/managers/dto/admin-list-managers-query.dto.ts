import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';
import { parseCsvEnumQueryParam } from '../../common/parse-csv-query-param';
import {
  AdminManagerOrder,
  AdminManagerStatusFilter,
} from '../managers-list.constants';

export { AdminManagerOrder, AdminManagerStatusFilter };

const MANAGER_STATUS_FILTERS = Object.values(AdminManagerStatusFilter).filter(
  (entry) => entry !== AdminManagerStatusFilter.ALL,
);

export class AdminListManagersQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, MANAGER_STATUS_FILTERS),
  )
  @IsArray()
  @IsIn(MANAGER_STATUS_FILTERS, { each: true })
  status?: AdminManagerStatusFilter[];

  @IsOptional()
  @IsIn(Object.values(AdminManagerOrder))
  order?: AdminManagerOrder;
}
