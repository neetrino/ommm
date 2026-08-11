import {
  IsDateString,
  IsEmail,
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

export class AdminCreateClientDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Matches(LATIN_PERSON_NAME_PATTERN, { message: LATIN_PERSON_NAME_MESSAGE })
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Matches(LATIN_PERSON_NAME_PATTERN, { message: LATIN_PERSON_NAME_MESSAGE })
  lastName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  phone!: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}
