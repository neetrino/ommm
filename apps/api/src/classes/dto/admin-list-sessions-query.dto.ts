import { ClassSessionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';

export class AdminListSessionsQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(ClassSessionStatus)
  status?: ClassSessionStatus;

  @IsOptional()
  @IsString()
  coachId?: string;

  @IsOptional()
  @IsString()
  typeId?: string;

  @IsOptional()
  @Type(() => String)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  level?: string;

  @IsOptional()
  @Type(() => String)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  classFormat?: string;
}
