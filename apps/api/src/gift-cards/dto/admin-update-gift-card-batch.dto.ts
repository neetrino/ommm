import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  ValidateIf,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AdminUpdateGiftCardBatchDto {
  @IsOptional()
  @Type(() => Number)
  @ValidateIf(
    (value: AdminUpdateGiftCardBatchDto) => value.amountCents === undefined,
  )
  @IsInt()
  @Min(1)
  amountAmd?: number;

  /** Backward-compatible alias for older clients. */
  @IsOptional()
  @Type(() => Number)
  @ValidateIf(
    (value: AdminUpdateGiftCardBatchDto) => value.amountAmd === undefined,
  )
  @IsInt()
  @Min(1)
  amountCents?: number;

  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  recipientId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  message?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  expiresAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;

  get resolvedAmountAmd(): number | undefined {
    return this.amountAmd ?? this.amountCents;
  }
}
