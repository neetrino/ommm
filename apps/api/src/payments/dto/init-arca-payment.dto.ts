import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class InitArcaPaymentDto {
  @IsString()
  @MinLength(4)
  @MaxLength(64)
  paymentReference!: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  locale?: string;
}
