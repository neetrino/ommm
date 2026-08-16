import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';

export const CALL_TASK_LIST_ORDERS = ['due-asc', 'due-desc', 'newest'] as const;
export type CallTaskListOrder = (typeof CALL_TASK_LIST_ORDERS)[number];

export const CALL_TASK_LIST_STATUSES = [
  'PENDING',
  'DONE',
  'CANCELLED',
  'OVERDUE',
] as const;
export type CallTaskListStatus = (typeof CALL_TASK_LIST_STATUSES)[number];

export class ListCallTasksQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsIn(CALL_TASK_LIST_STATUSES)
  status?: CallTaskListStatus;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value : undefined))
  @IsIn(CALL_TASK_LIST_ORDERS)
  order?: CallTaskListOrder;
}
