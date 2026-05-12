import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateGiftCheckoutDto {
  @IsInt()
  @Min(100)
  amountCents!: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  recipientName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}
