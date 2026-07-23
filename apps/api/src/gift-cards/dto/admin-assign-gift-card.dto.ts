import { IsString, MinLength } from 'class-validator';

export class AdminAssignGiftCardDto {
  @IsString()
  @MinLength(1)
  userId!: string;
}
