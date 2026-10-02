import { IsString, MaxLength, MinLength } from 'class-validator';

export class RedeemGiftDto {
  @IsString()
  @MinLength(4, { message: 'Invalid code' })
  @MaxLength(64)
  code!: string;
}
