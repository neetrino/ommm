import { IsOptional, IsString, MaxLength } from 'class-validator';

/** Member gift-recipient search query (`q` length is enforced in the service). */
export class ListGiftRecipientsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;
}
