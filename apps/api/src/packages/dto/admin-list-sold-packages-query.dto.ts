import { IsOptional, IsString } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';

export class AdminListSoldPackagesQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  planId?: string;
}
