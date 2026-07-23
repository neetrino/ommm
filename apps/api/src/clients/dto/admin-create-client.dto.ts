import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class AdminCreateClientDto {
  @IsEmail()
  email!: string;

  @ValidateIf((dto: AdminCreateClientDto) => dto.autoGeneratePassword !== true)
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password?: string;

  @IsOptional()
  @IsBoolean()
  autoGeneratePassword?: boolean;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  lastName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  phone!: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsBoolean()
  forcePasswordResetOnFirstLogin?: boolean;

  @IsOptional()
  @IsBoolean()
  sendWelcomeEmail?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}
