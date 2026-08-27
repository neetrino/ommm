import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { RETROACTIVE_ATTACH_NOTE_MAX_LENGTH } from '../clients-bookings-retroactive.constants';

/** Admin attaches a past class to an existing client package. */
export class AdminAttachPastSessionDto {
  @IsString()
  @MinLength(1)
  sessionId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(RETROACTIVE_ATTACH_NOTE_MAX_LENGTH)
  note?: string;
}
