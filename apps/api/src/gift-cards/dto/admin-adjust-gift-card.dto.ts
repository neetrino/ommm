import { IsInt, IsISO8601, IsOptional, Min } from 'class-validator';

export class AdminExtendGiftCardDto {
  @IsISO8601()
  expiresAt!: string;
}

export class AdminAdjustGiftCardDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  balanceAmd?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  balanceClasses?: number;
}
