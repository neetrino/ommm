import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ManualNotifyWaitlistEntryDto {
  @IsOptional()
  @IsString()
  @MaxLength(240)
  subject?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  message?: string;
}
