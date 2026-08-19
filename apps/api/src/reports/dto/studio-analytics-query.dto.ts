import { IsOptional, IsString } from 'class-validator';
import { DateRangeQueryDto } from './date-range-query.dto';

export class StudioAnalyticsQueryDto extends DateRangeQueryDto {
  @IsOptional()
  @IsString()
  coachId?: string;

  @IsOptional()
  @IsString()
  classTypeId?: string;
}
