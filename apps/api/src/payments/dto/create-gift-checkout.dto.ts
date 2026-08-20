import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGiftCheckoutDto {
  @IsOptional()
  @IsString()
  @MaxLength(191)
  batchId?: string;

  @IsOptional()
  @Type(() => Number)
  @ValidateIf((value: CreateGiftCheckoutDto) => value.amountCents === undefined)
  @IsInt()
  @Min(1)
  amountAmd?: number;

  /** Backward-compatible alias for older clients. */
  @IsOptional()
  @Type(() => Number)
  @ValidateIf((value: CreateGiftCheckoutDto) => value.amountAmd === undefined)
  @IsInt()
  @Min(1)
  amountCents?: number;

  /** Studio member selected as gift recipient (preferred over free-text email). */
  @IsOptional()
  @IsString()
  @MaxLength(191)
  recipientId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  recipientName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  get resolvedAmountAmd(): number | undefined {
    return this.amountAmd ?? this.amountCents;
  }
}
