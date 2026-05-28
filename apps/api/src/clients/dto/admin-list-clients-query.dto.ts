import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum AdminClientMembershipFilter {
  ALL = 'all',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum AdminClientOrder {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

export class AdminListClientsQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(Object.values(AdminClientMembershipFilter))
  membership?: AdminClientMembershipFilter;

  @IsOptional()
  @IsIn(Object.values(AdminClientOrder))
  order?: AdminClientOrder;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(500)
  take?: number;
}
