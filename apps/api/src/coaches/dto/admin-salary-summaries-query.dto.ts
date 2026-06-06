import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';

const PAYOUT_STATUSES = ['', 'paid', 'pending', 'none'] as const;
const SALARY_ORDERS = ['newest', 'oldest', 'highest-salary'] as const;
const SALARY_QUICK = ['', 'paid', 'pending', 'high-salary', 'recent-payments'] as const;

export class AdminSalarySummariesQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/)
  month?: string;

  @IsOptional()
  @IsIn(PAYOUT_STATUSES)
  payoutStatus?: (typeof PAYOUT_STATUSES)[number];

  @IsOptional()
  @IsIn(SALARY_ORDERS)
  order?: (typeof SALARY_ORDERS)[number];

  @IsOptional()
  @IsIn(SALARY_QUICK)
  quick?: (typeof SALARY_QUICK)[number];
}
