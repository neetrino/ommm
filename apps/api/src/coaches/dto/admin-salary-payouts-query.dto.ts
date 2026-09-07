import { IsOptional, IsString, Matches } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';

export class AdminSalaryPayoutsQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  /** When set, only payouts for that calendar month (`YYYY-MM`). */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/)
  month?: string;
}
