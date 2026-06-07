import { IsEnum, IsOptional } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';

export enum MyBookingsScope {
  UPCOMING = 'upcoming',
  PAST = 'past',
}

export class ListMyBookingsQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsEnum(MyBookingsScope)
  scope?: MyBookingsScope;
}
