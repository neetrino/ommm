import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';

export class AdminListSessionsQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  from?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;

  /** Comma-separated coach profile ids. */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  coachIds?: string;

  /** Comma-separated class type ids (resolved from package filters on web). */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  classTypeIds?: string;

  /** Comma-separated session statuses (FULL applied after load). */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  statuses?: string;

  /** Comma-separated level labels. */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  levels?: string;

  /** Comma-separated: available, full */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  availability?: string;

  /** Comma-separated: morning, afternoon, evening */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  timeOfDay?: string;

  /** Comma-separated schedule quick filter keys. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  quick?: string;

  /** @deprecated Use classTypeIds */
  @IsOptional()
  @IsString()
  coachId?: string;

  /** @deprecated Use classTypeIds */
  @IsOptional()
  @IsString()
  typeId?: string;

  /** @deprecated Use levels */
  @IsOptional()
  @IsString()
  level?: string;

  /** @deprecated Use statuses */
  @IsOptional()
  @IsString()
  status?: string;

  /** @deprecated */
  @IsOptional()
  @IsString()
  classFormat?: string;
}
