import { IsIn, IsOptional, IsString } from 'class-validator';

export enum AdminCoachActiveFilter {
  ALL = 'all',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum AdminCoachOrder {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

export class AdminListCoachesQueryDto {
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
