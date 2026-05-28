import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RequestAccountDeletionDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
