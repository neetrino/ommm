import { IsOptional, IsString, MinLength } from 'class-validator';

/** Admin assigns a booking to a client (phone / walk-in). */
export class AdminCreateClientBookingDto {
  @IsString()
  @MinLength(1)
  sessionId!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  userPackageId?: string;
}
