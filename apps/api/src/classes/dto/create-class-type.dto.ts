import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateClassTypeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;
}
