import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { SessionListOrder } from '../../common/enums/list-order.enum';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';

export enum MyBookingsScope {
  UPCOMING = 'upcoming',
  PAST = 'past',
}

export class ListMyBookingsQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsEnum(MyBookingsScope)
  scope?: MyBookingsScope;

  @IsOptional()
  @IsIn([
    SessionListOrder.UPCOMING,
    SessionListOrder.DATE_ASC,
    SessionListOrder.DATE_DESC,
  ])
  order?: SessionListOrder;
}
