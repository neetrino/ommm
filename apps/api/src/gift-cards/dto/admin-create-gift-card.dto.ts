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

export class AdminCreateGiftCardDto {
  @IsOptional()
  @Type(() => Number)
  @ValidateIf((value: AdminCreateGiftCardDto) => value.amountCents === undefined)
  @IsInt()
  @Min(1)
  amountAmd?: number;

  /** Backward-compatible alias for older clients. */
  @IsOptional()
  @Type(() => Number)
  @ValidateIf((value: AdminCreateGiftCardDto) => value.amountAmd === undefined)
  @IsInt()
  @Min(1)
  amountCents?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity = 1;

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
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;

  get resolvedAmountAmd(): number | undefined {
    return this.amountAmd ?? this.amountCents;
  }
}
