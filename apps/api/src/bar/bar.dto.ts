import { IsBoolean, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateBarProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(1)
  priceAmd!: number;
}

export class UpdateBarProductDto {
  @IsBoolean()
  active!: boolean;
}
