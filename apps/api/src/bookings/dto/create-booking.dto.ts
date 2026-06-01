import { BookingChannel } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsOptional()
  @IsEnum(BookingChannel)
  channel?: BookingChannel;
}
