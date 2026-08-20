import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Member gift-recipient search — min length avoids dumping the full user list. */
export class ListGiftRecipientsQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  q?: string;
}
