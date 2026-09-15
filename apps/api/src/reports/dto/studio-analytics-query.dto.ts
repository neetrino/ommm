import { IsArray, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { DateRangeQueryDto } from './date-range-query.dto';
import { parseCsvQueryParam } from '../../common/parse-csv-query-param';

export class StudioAnalyticsQueryDto extends DateRangeQueryDto {
  @IsOptional()
  @Transform(({ value }) => {
    const parts = parseCsvQueryParam(value);
    return parts.length > 0 ? parts : undefined;
  })
  @IsArray()
  @IsString({ each: true })
  coachId?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    const parts = parseCsvQueryParam(value);
    return parts.length > 0 ? parts : undefined;
  })
  @IsArray()
  @IsString({ each: true })
  classTypeId?: string[];
}
