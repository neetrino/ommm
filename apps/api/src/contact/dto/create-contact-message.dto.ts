import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateContactMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(40)
  phone!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  message!: string;
}
