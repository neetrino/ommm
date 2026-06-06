import { IsIn, IsOptional, IsString } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';

export enum AdminCoachActiveFilter {
  ALL = 'all',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum AdminCoachOrder {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

export class AdminListCoachesQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  classType?: string;

  @IsOptional()
  @IsIn(Object.values(AdminCoachActiveFilter))
  isActive?: AdminCoachActiveFilter;

  @IsOptional()
  @IsIn(Object.values(AdminCoachOrder))
  order?: AdminCoachOrder;
}
