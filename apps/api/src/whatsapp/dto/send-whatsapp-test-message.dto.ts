import { IsString, MaxLength, MinLength } from 'class-validator';

export class SendWhatsappTestMessageDto {
  @IsString()
  @MinLength(8)
  @MaxLength(24)
  phone!: string;
}
