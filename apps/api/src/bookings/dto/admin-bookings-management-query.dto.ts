import { BookingChannel, BookingStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ListPaginationQueryDto } from '../../common/dto/list-pagination-query.dto';

export class AdminBookingsManagementQueryDto extends ListPaginationQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  classTypeId?: string;

  @IsOptional()
  @IsString()
  coachId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsEnum(BookingChannel)
  channel?: BookingChannel;

  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @IsOptional()
  @IsString()
  attendanceStatus?: string;
}
