import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { PaymentStatus } from '@prisma/client';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';

export class ListMyPaymentsQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsIn(['newest', 'oldest'])
  order?: 'newest' | 'oldest';
}
