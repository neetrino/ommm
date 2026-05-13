import {
  IsEmail,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  avatarUrl?: string;

  @IsOptional()
  @IsIn(['hy', 'en', 'ru'])
  locale?: string;
}
