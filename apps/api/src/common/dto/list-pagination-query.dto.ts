import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const DEFAULT_LIST_PAGE_SIZE = 25;
export const MAX_LIST_PAGE_SIZE = 100;

export class ListPaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIST_PAGE_SIZE)
  take?: number;
}
