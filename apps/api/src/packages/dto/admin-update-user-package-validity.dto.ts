import { IsDateString, IsOptional } from 'class-validator';

/** Admin extends or adjusts a client's package validity window. */
export class AdminUpdateUserPackageValidityDto {
  @IsDateString()
  currentPeriodEnd!: string;

  @IsOptional()
  @IsDateString()
  currentPeriodStart?: string;
}
