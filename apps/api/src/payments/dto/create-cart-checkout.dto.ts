import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCartCheckoutDto {
  @IsOptional()
  @IsString()
  packagePlanId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  barProductId?: string;

  @IsOptional()
  @IsBoolean()
  useGiftCredits?: boolean;
}
