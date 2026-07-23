import { IsString } from 'class-validator';

export class PromoteWaitlistEntryDto {
  @IsString()
  targetSessionId!: string;
}
