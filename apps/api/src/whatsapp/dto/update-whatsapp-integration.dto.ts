import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateWhatsappIntegrationDto {
  @IsOptional()
  @ValidateIf(
    (_object, value: string | undefined) =>
      typeof value === 'string' && value.trim().length > 0,
  )
  @IsString()
  @MaxLength(512)
  @Matches(/^https:\/\/.+/i, { message: 'Gateway URL must use HTTPS' })
  gatewayUrl?: string;

  @IsOptional()
  @ValidateIf(
    (_object, value: string | undefined) =>
      typeof value === 'string' && value.trim().length > 0,
  )
  @IsString()
  @MinLength(8)
  @MaxLength(256)
  gatewayToken?: string;
}
