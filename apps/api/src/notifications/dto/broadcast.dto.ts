import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum BroadcastAudience {
  USERS = 'users',
  COACHES = 'coaches',
  STAFF = 'staff',
  ALL = 'all',
}

export class BroadcastDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20_000)
  html!: string;

  @IsOptional()
  @IsEmail()
  testTo?: string;

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
