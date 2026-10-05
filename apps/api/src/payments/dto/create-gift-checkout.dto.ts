import {
  IsEmail,
  IsIn,
  IsInt,
  IsISO8601,
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

  /** Studio member. Omit to gift by name/email, or to keep the code with the buyer. */
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

  /** WhatsApp number when delivery is WHATSAPP. */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  recipientPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @IsOptional()
  @IsIn(['FIXED_VALUE', 'FIXED_CLASS'])
  type?: 'FIXED_VALUE' | 'FIXED_CLASS';

  @IsOptional()
  @IsString()
  @MaxLength(191)
  classTypeId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  classQuantity?: number;

  /** Package being gifted. The recipient chooses the class day later. */
  @IsOptional()
  @IsString()
  @MaxLength(191)
  packagePlanId?: string;

  @IsOptional()
  @IsIn(['EMAIL', 'WHATSAPP', 'PRINT'])
  delivery?: 'EMAIL' | 'WHATSAPP' | 'PRINT';

  /** Digital is free. Physical adds the print fee on the server. */
  @IsOptional()
  @IsIn(['DIGITAL', 'PHYSICAL'])
  format?: 'DIGITAL' | 'PHYSICAL';

  @IsOptional()
  @IsISO8601()
  deliverAt?: string;

  get resolvedAmountAmd(): number | undefined {
    return this.amountAmd ?? this.amountCents;
  }
}
