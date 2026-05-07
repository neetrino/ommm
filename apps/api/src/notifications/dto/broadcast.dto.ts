import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class BroadcastDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20_000)
  html!: string;

  @IsOptional()
  @IsEmail()
  testTo?: string;
}
