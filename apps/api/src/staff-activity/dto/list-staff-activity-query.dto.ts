import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { MAX_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { STAFF_ACTIVITY_PAGE_TAKE } from './staff-activity.constants';

export class ListStaffActivityQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIST_PAGE_SIZE)
  take?: number = STAFF_ACTIVITY_PAGE_TAKE;
}
