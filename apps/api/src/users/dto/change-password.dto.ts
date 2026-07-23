import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Matches registration password length rules (see RegisterDto). */
export class ChangePasswordDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  currentPassword?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  confirmNewPassword!: string;
}
