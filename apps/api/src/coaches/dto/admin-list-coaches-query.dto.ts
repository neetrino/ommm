import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';
import {
  parseCsvEnumQueryParam,
  parseCsvQueryParam,
} from '../../common/parse-csv-query-param';

export enum AdminCoachActiveFilter {
  ALL = 'all',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum AdminCoachOrder {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

const COACH_ACTIVE_FILTERS = Object.values(AdminCoachActiveFilter).filter(
  (entry) => entry !== AdminCoachActiveFilter.ALL,
);

export class AdminListCoachesQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @Transform(({ value }) => {
    const parts = parseCsvQueryParam(value);
    return parts.length > 0 ? parts : undefined;
  })
  @IsArray()
  @IsString({ each: true })
  classType?: string[];

  @IsOptional()
  @Transform(({ value }) => parseCsvEnumQueryParam(value, COACH_ACTIVE_FILTERS))
  @IsArray()
  @IsIn(COACH_ACTIVE_FILTERS, { each: true })
  isActive?: AdminCoachActiveFilter[];

  @IsOptional()
  @IsIn(Object.values(AdminCoachOrder))
  order?: AdminCoachOrder;
}
