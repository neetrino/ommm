import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  LATIN_PERSON_NAME_MESSAGE,
  LATIN_PERSON_NAME_PATTERN,
} from '../../common/latin-person-name';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Matches(LATIN_PERSON_NAME_PATTERN, { message: LATIN_PERSON_NAME_MESSAGE })
  name!: string;

  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Matches(LATIN_PERSON_NAME_PATTERN, { message: LATIN_PERSON_NAME_MESSAGE })
  lastName!: string;

  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  phone!: string;

  @IsOptional()
  @IsIn(['hy', 'en', 'ru'])
  locale?: string;
}
