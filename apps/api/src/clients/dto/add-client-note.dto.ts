import { IsString, MaxLength, MinLength } from 'class-validator';

export class AddClientNoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;
}
