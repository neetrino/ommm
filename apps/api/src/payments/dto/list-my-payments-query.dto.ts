import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional } from 'class-validator';
import { PaymentStatus } from '@prisma/client';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';
import { parseCsvEnumQueryParam } from '../../common/parse-csv-query-param';

export class ListMyPaymentsQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    parseCsvEnumQueryParam(value, Object.values(PaymentStatus)),
  )
  @IsArray()
  @IsIn(Object.values(PaymentStatus), { each: true })
  status?: PaymentStatus[];

  @IsOptional()
  @IsIn(['newest', 'oldest'])
  order?: 'newest' | 'oldest';
}
