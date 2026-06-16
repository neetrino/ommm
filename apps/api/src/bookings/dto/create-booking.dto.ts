import { BookingChannel } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsOptional()
  @IsEnum(BookingChannel)
  channel?: BookingChannel;

  @IsOptional()
  @IsString()
  userPackageId?: string;
}
