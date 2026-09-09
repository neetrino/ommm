import { IsOptional, Matches } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';

/** Query for the per-session salary breakdown behind one coach's monthly total. */
export class AdminCoachSalarySessionsQueryDto extends ListPaginationQueryDto {
  /** Calendar month (`YYYY-MM`); defaults to the current studio month. */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/)
  month?: string;
}
