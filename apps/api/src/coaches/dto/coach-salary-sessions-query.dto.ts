import { IsOptional, Matches } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';

/**
 * Query for the per-session salary breakdown behind a coach's monthly total.
 * Shared by the admin ("any coach") and coach panel ("self") endpoints.
 */
export class CoachSalarySessionsQueryDto extends ListPaginationQueryDto {
  /** Calendar month (`YYYY-MM`); defaults to the current studio month. */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/)
  month?: string;
}
