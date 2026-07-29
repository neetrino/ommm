import { IsDateString, IsOptional } from 'class-validator';

/** Date range for admin client bookable-session picker. */
export class AdminClientBookableSessionsQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
