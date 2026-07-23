import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { BroadcastAudience } from './broadcast.dto';

export class UpdateScheduledBroadcastDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20_000)
  html?: string;

  @IsOptional()
  @IsEnum(BroadcastAudience)
  audience?: BroadcastAudience;

  @IsOptional()
  @IsBoolean()
  onlyPromotionsOptIn?: boolean;

  @IsOptional()
  @IsISO8601()
  scheduleAt?: string;
}
