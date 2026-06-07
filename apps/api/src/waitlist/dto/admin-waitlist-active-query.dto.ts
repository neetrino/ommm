import { IsIn, IsOptional } from 'class-validator';
import {
  DateListOrder,
  SessionListOrder,
} from '../../common/enums/list-order.enum';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';

export class AdminWaitlistActiveQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsIn([
    DateListOrder.NEWEST,
    DateListOrder.OLDEST,
    SessionListOrder.UPCOMING,
    SessionListOrder.DATE_ASC,
    SessionListOrder.DATE_DESC,
  ])
  order?: DateListOrder | SessionListOrder;
}
