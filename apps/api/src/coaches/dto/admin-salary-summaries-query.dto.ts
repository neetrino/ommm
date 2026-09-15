import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';
import { parseCsvEnumQueryParam } from '../../common/parse-csv-query-param';

export const PAYOUT_STATUS_FILTERS = ['paid', 'pending', 'none'] as const;
export type CoachSalaryPayoutStatusFilter =
  (typeof PAYOUT_STATUS_FILTERS)[number];

const SALARY_ORDERS = ['newest', 'oldest', 'highest-salary'] as const;

export const SALARY_QUICK_FILTERS = [
  'paid',
  'pending',
  'high-salary',
  'recent-payments',
] as const;
export type CoachSalaryQuickFilter = (typeof SALARY_QUICK_FILTERS)[number];

export class AdminSalarySummariesQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  /** @deprecated Prefer `from` / `to`. Kept for older clients. */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/)
  month?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to?: string;

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, PAYOUT_STATUS_FILTERS),
  )
  @IsArray()
  @IsIn([...PAYOUT_STATUS_FILTERS], { each: true })
  payoutStatus?: CoachSalaryPayoutStatusFilter[];

  @IsOptional()
  @IsIn(SALARY_ORDERS)
  order?: (typeof SALARY_ORDERS)[number];

  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, SALARY_QUICK_FILTERS),
  )
  @IsArray()
  @IsIn([...SALARY_QUICK_FILTERS], { each: true })
  quick?: CoachSalaryQuickFilter[];
}
