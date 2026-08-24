import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class PaymentOutcomeQueryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  reference!: string;
}
