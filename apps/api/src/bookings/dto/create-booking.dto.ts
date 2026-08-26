import { BookingChannel } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBookingDto {
  @IsOptional()
  @IsEnum(BookingChannel)
  channel?: BookingChannel;

  @IsOptional()
  @IsString()
  @MinLength(1)
  userPackageId?: string;

  /** When set, this booking is a guest-pass companion (no owner session debit). */
  @IsOptional()
  @IsString()
  @MinLength(1)
  guestName?: string;
}
